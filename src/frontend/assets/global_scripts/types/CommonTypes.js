import { IdentiyProvider } from "../IdentityConnector/identity/IdentityProvider.js";
import {createEnum} from "../utils/CommonUtils.js";
import {PageTrabyterBucks} from "../../pages/Tokens_Nft/TrabyterBucks/PageTrabyterBucksToken.js";
import {TrabyterBucksTokenInterface} from "../../pages/Tokens_Nft/TrabyterBucks/Interface/PageTrabyterBucksTokenInterface.js";
import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { Artemis } from 'artemis-web3-adapter';
import { PageTrabyterPremiumBucks } from "../../pages/Tokens_Nft/TrabyterPremiumBucks/PageTrabyterPremiumBucksToken.js";
import { PriceFetcher } from "../utils/PriceFetcher.js";
import { PageTrabyterBucksTokenInformation } from "../../pages/Tokens_Nft/TrabyterBucks/Information/PageTrabyterBucksTokenInformation.js";


class CommonTypesModel {
   
    WalletTypes = createEnum(['NoWallet', 'plug', 'stoic', 'dfinity']);
    CommonIdentityProvider;
    LogicTrabyterBucksToken;
    LogicTrabyterBucksTokenInterface;  
    LogicTrabyterBucksPriceFetcher;

    LogicTrabyterPremiumBucksToken;    
    LogicTrabyterPremiumBucksTokenInterface;      
    LogicTrabyterPremiumBucksPriceFetcher;

    Artemis = Artemis;
    Actor = Actor;
    HttpAgent = HttpAgent;  
    Principal = Principal;  
    InDesigner = false;   
    constructor() {
        
    }

    Init()
    {
        this.CommonIdentityProvider = new IdentiyProvider();    
        this.LogicTrabyterBucksToken = new PageTrabyterBucks();  
        this.LogicTrabyterPremiumBucksToken = new PageTrabyterPremiumBucks();
        this.LogicTrabyterBucksTokenInterface = new TrabyterBucksTokenInterface();
        this.LogicTrabyterBucksPriceFetcher = new PageTrabyterBucksTokenInformation();
    }
}

class ThirdPartyTypesModel {
    
    // Artemis = Artemis;
    // Actor = Actor;
    // HttpAgent = HttpAgent;  
    // Principal = Principal;  
    constructor() {        
    }
}
//export const ThirdPartyTypes = new ThirdPartyTypesModel();

export const CommonTypes = new CommonTypesModel();



// export const WalletTypes = createEnum(['NoWallet', 'plug', 'stoic', 'dfinity']);
// export const CommonIdentityProvider = new IdentiyProvider();

// export const LogicSliToken = new PageSliToken();   