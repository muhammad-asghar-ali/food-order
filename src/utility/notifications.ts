export const GenerateOtp = () => {
  const otp = Math.floor(10000 + Math.random() * 900000);
  let expiry = new Date();
  expiry.setTime(new Date().getTime() + 30 * 60 * 1000);

  return { otp, expiry };
};

export const onRequestOTP = async(otp: number, toPhoneNumber: string) => {

    try {
        const accountSid = process.env.SID;
        const authToken = process.env.TOKEN;
        const client = require('twilio')(accountSid, authToken);
    
        const response = await client.messages.create({
            body: `Your OTP is ${otp}`,
            from: process.env.NUMBER,
            to: `+92${toPhoneNumber}` // recipient phone number // Add country before the number
        })
    
        return response;
    } catch (error){
        return false
    }
    
}