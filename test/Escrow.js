const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {

    let buyer,seller,inspector,lender,appraiser;
    let realEstate,escrow;

    beforeEach(async ()=>{
         //Setup accounts
         [buyer,seller,inspector,lender,appraiser] = await ethers.getSigners();
        
         
         //Deploy Real Estate
         const RealEstate = await ethers.getContractFactory('RealEstate');
         realEstate = await RealEstate.deploy();
         await realEstate.deployed();
         console.log(realEstate.address);//0x5FbDB2315678afecb367f032d93F642f64180aa3
 
 
         //Mint
         let transaction = await realEstate.
         //to do from seller's perspective,connect to seller
         connect(seller).mint("https://ipfs.io/ipfs/83fyouuhdd/1.json");
         await transaction.wait();
 
 
         const Escrow = await ethers.getContractFactory('Escrow');
         escrow = await Escrow.deploy(
             realEstate.address,
             seller.address,
             inspector.address,
             lender.address,
             appraiser.address
         );
         await escrow.deployed();

         //Approving is an important step
         transaction = await realEstate.connect(seller).approve(escrow.address,1);
         await transaction.wait();

         //list property
         transaction = await escrow.connect(seller).list(1,buyer.address,tokens(10),tokens(5));
         await transaction.wait();
    })

    describe('Deployment',()=>{

        it('Returns NFT address',async ()=>{
            const result = await escrow.nftAddress();
            expect(result).to.be.equal(realEstate.address);
        });
        it('Returns seller',async ()=>{
            const result = await escrow.seller();
            expect(result).to.be.equal(seller.address);
        });
        it('Returns inspector',async ()=>{
            const result = await escrow.inspector();
            expect(result).to.be.equal(inspector.address);
        });
        it('Returns lender',async ()=>{
            const result = await escrow.lender();
            expect(result).to.be.equal(lender.address);
        });
        it('Returns appraiser',async ()=>{
            const result = await escrow.appraiser();
            expect(result).to.be.equal(appraiser.address);
        });
    });

    describe('Listing',()=>{
        it('Updates ownership from seller to contract',async()=>{
            //ownerOf(tokenId) from ERC721
            expect(await realEstate.connect(seller).ownerOf(1)).to.be.equal(escrow.address);
        });

        it('Updates as listed',async()=>{
            const result = await escrow.connect(seller).isListed(1);
            expect(result).to.be.equal(true);
        });

        it('Returns buyer',async () => {
            const result = await escrow.connect(seller).buyer(1);
            expect(result).to.be.equal(buyer.address);
        });

        it('Returns purchase price',async ()=>{
            const result = await escrow.connect(seller).purchasePrice(1);
            expect(result).to.be.equal(tokens(10));
        });

        it('Returns escrow amount',async ()=>{
            const result = await escrow.connect(seller).escrowAmount(1);
            expect(result).to.be.equal(tokens(5));
        })


    });


    describe('Deposists',()=>{
        it('Updates contract balance',async()=>{
            const transaction = await escrow.connect(buyer).depositEarnest(1,{value:tokens(5)});
            await transaction.wait();
            const result = await escrow.getBalance();
            expect(result).to.be.equal(tokens(5));
        });
    });

    describe('Inspection', () => {
        it('Updates inpsection status',async () => {
            const transaction = await escrow.connect(inspector).updateInspectionStatus(1,true);
            await transaction.wait();
            const result = await escrow.inspectionPassed(1);
            expect(result).to.be.equal(true);
        });
     });

    describe('Appraisal', () => {
        it('Updates appraisal status',async () => {
            const transaction = await escrow.connect(appraiser).updateAppraisalStatus(1,true);
            await transaction.wait();
            const result = await escrow.appraisalPassed(1);
            expect(result).to.be.equal(true);
        });
     });


    describe('Approval', () => {
        it('Updates approval status',async () => {
            let transaction = await escrow.connect(buyer).approveSale(1);
            await transaction.wait();

            transaction = await escrow.connect(seller).approveSale(1);
            await transaction.wait();

            transaction = await escrow.connect(lender).approveSale(1);
            await transaction.wait();

            transaction = await escrow.connect(appraiser).approveSale(1);
            await transaction.wait();

            expect(await escrow.approval(1,buyer.address)).to.be.equal(true);
            expect(await escrow.approval(1,seller.address)).to.be.equal(true);
            expect(await escrow.approval(1,lender.address)).to.be.equal(true);
            expect(await escrow.approval(1,lender.address)).to.be.equal(true);
        });
     });


     describe('Sale', async () => {
        beforeEach(async () => {
            let transaction = await escrow.connect(buyer).depositEarnest(1,{value : tokens(5)});
            await transaction.wait();

            transaction = await escrow.connect(inspector).updateInspectionStatus(1,true);
            await transaction.wait();

            transaction = await escrow.connect(appraiser).updateAppraisalStatus(1,true);
            await transaction.wait();
            
            transaction = await escrow.connect(appraiser).approveSale(1);
            await transaction.wait();

            transaction = await escrow.connect(buyer).approveSale(1);
            await transaction.wait();

            transaction = await escrow.connect(seller).approveSale(1);
            await transaction.wait();

            transaction = await escrow.connect(lender).approveSale(1);
            await transaction.wait();


            await lender.sendTransaction({to:escrow.address,value:tokens(5)});

            transaction = await escrow.connect(seller).finaliseSale(1);
            await transaction.wait();
        });

        it('Updates ownership',async()=>{
            expect(await realEstate.ownerOf(1)).to.be.equal(buyer.address);
        });

        it('Updates balance',async () => {
            expect(await escrow.getBalance()).to.be.equal(0);
        });

        it('Removes from listing',async()=>{
            expect(await escrow.isListed[1] === false);
        });
     });

    
    
})
