import { Sablier } from "paystream-sdk";
import { useCallback } from "react";
import { dappConfig } from "../../config";
import { chainDict } from "../../constants/networks";
import useAsync from "../useAsync";


export type SablierQueries = "owner";
/**
 * Get the Paystream Contract Owner 
 * @param contract 
 * @returns 
 */
export const useOwnerQuery = (contracAddress: string): {
        loading: boolean,
        error: Error | null,
        owner: string | null
    } => {
    const execute = useCallback(async (): Promise<string> => {
        const contract = new Sablier({
            web3Host: chainDict[dappConfig.chainId].rpc,
        }, contracAddress);
        await contract.start();
        return contract.owner();
    }, [contracAddress]);
    
    const { loading , error, result } = useAsync(execute);
    
    return {loading , error, owner: result };
  };
  
