import axios from 'axios'
import { TradeHistory } from '../types/raydium'
import { API_URL } from '../constant'

export async function checkTrades(poolId:string) {
  

    const r = await axios.get<{
        id: string
        success: boolean
        msg?: string
        data: {
            rows: TradeHistory[]
        }
    }>(`${API_URL}/trade?poolId=${poolId}&limit=50`)
    const data =r.data.data.rows
    return data

  
}
