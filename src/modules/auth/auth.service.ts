import { injectable } from "tsyringe";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDTO } from "./dto/register.dto";
import { ApiError } from "../../utils/api-error";
import { PasswordService } from "./password.service";

@injectable()
export class AuthService {
  private prisma: PrismaService;
  private passwordService: PasswordService;

  constructor(PrismaClient: PrismaService, PasswordService: PasswordService) {
    this.prisma = PrismaClient;
    this.passwordService = PasswordService;
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
}
