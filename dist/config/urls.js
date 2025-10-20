import dotenv from 'dotenv';
dotenv.config();
export default {
    port: parseInt(process.env.PORT || '5000'),
    mongo: `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASSWORD}@${process.env.MONGOHOST}/?retryWrites=true&w=majority`
};
//# sourceMappingURL=urls.js.map