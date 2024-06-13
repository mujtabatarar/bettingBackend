import { registerAs } from "@nestjs/config";


export default registerAs('app', () => ({
    KafkaHost: process.env.KAFKA_HOST,
    TCPPort: process.env.TCP_PORT,
    logMode: process.env.LOG_MODE,
    TCPHost: process.env.TCP_HOST,
    SuperAdminEmail: process.env.SUPER_ADMIN_EMAIL,
    JwtSecret: process.env.JWT_SECRET,
    JwtExpires: process.env.JWT_EXPIRES,
    frontEndUrl: process.env.FRONTEND_URL
}));