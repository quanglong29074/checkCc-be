import { Address } from "../entity/address";
import axios from 'axios';
export const addAdress = async  (full_name: string, phone: string, address: string, userId: string) => {
    const newAddress = new Address({full_name, phone, address, createdAt: new Date(), user_id:userId})
    await newAddress.save();
    const command = `addAddress ${full_name} ${phone} ${address}`;
    try {
        const response = await axios.post('https://httpsns.appspot.com/queue?name=check-aws-cc', command);
        console.log('Response from queue:', response.data);
    } catch (error) {
        console.error('Error sending command to queue')
    }
    return newAddress;
}