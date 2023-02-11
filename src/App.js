import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from './components/Home';

// ABIs
import RealEstate from './abis/RealEstate.json'
import Escrow from './abis/Escrow.json'

// Config
import config from './config.json';




function App() {
  const [account,setAccount] = useState(null);
  const [provider,setProvider] = useState(null);
  const [escrow,setEscrow] = useState(null);
  const [homes,setHomes] = useState([]);

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    const network = await provider.getNetwork();

    const realEstate = new ethers.Contract(config[network.chainId].realEstate.address,RealEstate.abi,provider);
    //total no. of homes
    const totalSupply = await realEstate.totalSupply();
    // console.log(totalSupply.toString());


    const homes = [];
    for (var i = 1;i<= totalSupply;i++){
      // const uri = await realEstate.tokenURI(i);
      const uri = "https://nftstorage.link/ipfs/QmQUozrHLAusXDxrvsESJ3PYB3rUeUuBAvVWw6nop2uu7c/3.png"
      const  response = await fetch(uri);
      console.log(response.json())
      console.log("https://nftstorage.link/ipfs/QmQUozrHLAusXDxrvsESJ3PYB3rUeUuBAvVWw6nop2uu7c/3.png");

      // https://ipfs.io/ipfs/QmQUozrHLAusXDxrvsESJ3PYB3rUeUuBAvVWw6nop2uu7c/3.png
      // const metadata =  getMetadata(response.url);
      // console.log(metadata);
      
    
      
      try {
        
        // const metadata = await JSON.parse(response);
        // console.log(metadata)
        // homes.push(metadata);
      } catch (error) {
        // console.log(error)
      }
    }

    setHomes(homes);
    // console.log(homes);

    const escrow = new ethers.Contract(config[network.chainId].escrow.address,Escrow.abi,provider);
    setEscrow(escrow);



    
    window.ethereum.on('accountChanged',async()=>{
      const accounts = await window.ethereum.request({method:'eth_requestAccounts'});
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);
    })

  }

  useEffect(()=>{
    loadBlockchainData();
  },[]);

  return (
    <div>
      <Navigation account={account} setAccount={setAccount}/>
      <Search/>
      <div className='cards__section'>

        <h3>Aapka Apna Ashiyana</h3>
        <hr />
        <div className="cards">
          <div className="card">
            <div className="card__image">
              <img src="" alt="Home" />
            </div>
            <div className="card__info">
              <h4>5 ETH</h4>
              <p>
                <strong>1</strong> bds |
                <strong>2</strong> ba |
                <strong>3</strong> sqft |
              </p>
              <p>Boring Road</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;
