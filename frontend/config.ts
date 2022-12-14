export interface DappConfiguration {
    chainId: number;
    beproContracAddress: string;
    sablierContracAddress: string;
    
    autonnect: boolean;
    switchNetwork: boolean;
    addNewortk: boolean;
    disconnectOnSwitchAccount: boolean;
    disconnectOnChangeNetwork: boolean;
}

export const dappConfig: DappConfiguration = {
    chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID as string | "1337" ),
    beproContracAddress: process.env.NEXT_PUBLIC_BEPRO_CONTRACT_ADDRESS as string | "0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e",
    sablierContracAddress: process.env.NEXT_PUBLIC_SABLIER_CONTRACT_ADDRESS as string | "0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e",
    autonnect: false,
    switchNetwork: true,
    addNewortk: true,
    disconnectOnSwitchAccount: true,
    disconnectOnChangeNetwork: true,
};