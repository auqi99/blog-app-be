import { injectable } from "tsyringe";
import {
  BASE_URL_FE,
  JWT_SECRET_KEY,
  JWT_SECRET_KEY_FORGOT_PASSWORD,
} from "../../config";
import { ApiError } from "../../utils/api-error";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDTO } from "./dto/login.dto";
import { RegisterDTO } from "./dto/register.dto";
import { PasswordService } from "./password.service";
import { TokenService } from "./token.service";
import { ForgotPasswordDTO } from "./dto/forgot-password.dto";
import { MailService } from "../mail/mail.service";

@injectable()
export class AuthService {
  private prisma: PrismaService;
  private passwordService: PasswordService;
  private tokenService: TokenService;
  private mailService: MailService;

  constructor(
    PrismaClient: PrismaService,
    PasswordService: PasswordService,
    TokenService: TokenService,
    MailService: MailService
  ) {
    this.prisma = PrismaClient;
    this.passwordService = PasswordService;
    this.tokenService = TokenService;
    this.mailService = MailService;
  }

  register = async (body: RegisterDTO) => {
    const { name, email, password } = body;

    const existingUser = await this.prisma.user.findFirst({ where: { email } });

    if (existingUser) {
      throw new ApiError(400, "User already exists");
    }

    const hashedPassword = await this.passwordService.hashPassword(password);

    return await this.prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
      },
      omit: { password: true },
    });
  };

  login = async (body: LoginDTO) => {
    const { email, password } = body;

    const existingUser = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!existingUser) {
      throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    const accessToken = this.tokenService.generateToken(
      { id: existingUser.id },
      JWT_SECRET_KEY!,
      { expiresIn: "3h" }
    );

    const { password: pw, ...userWithoutPassword } = existingUser;

    return { ...userWithoutPassword, accessToken };
  };

  forgotPassword = async (body: ForgotPasswordDTO) => {
    const { email } = body;

    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new ApiError(400, "Invalid email address");
    }

    const token = this.tokenService.generateToken(
      { id: user.id },
      JWT_SECRET_KEY_FORGOT_PASSWORD!,
      { expiresIn: "1h" }
    );

    const link = `${BASE_URL_FE}/reset-password/${token}`;

    await this.mailService.sendEmail(
      email,
      "Link reset password",
      "forgot-password",
      { name: user.name, resetLink: link, expiryTime: 1 }
    );

    return { message: "Send email success" };
  };
}
