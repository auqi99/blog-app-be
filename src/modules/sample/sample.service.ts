import { injectable } from "tsyringe";
import { ApiError } from "../../utils/api-error";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSampleDTO } from "./dto/create-sample.dto";
import { UpdateSampleDTO } from "./dto/update-sample.dto";

@injectable()
export class SampleService {
  private prisma: PrismaService;

  constructor(PrismaClient: PrismaService) {
    this.prisma = PrismaClient;
  }

  getSamples = async () => {
    const samples = await this.prisma.sample.findMany();
    return samples;
  };

  getSample = async (id: number) => {
    const sample = await this.findSampleOrThrow(id);
    // const sample = await this.prisma.sample.findFirst({
    //   where: { id },
    // });

    // if (!sample) {
    //   throw new ApiError(404, "Sample not found");
    // }

    return sample;
  };

  createSample = async (body: CreateSampleDTO) => {
    const newSample = await this.prisma.sample.create({
      data: body,
    });

    // return await this.prisma.sample.create({
    //   data: body,
    // });  versi lebih rapi

    return newSample;
  };

  updateSample = async (id: number, body: UpdateSampleDTO) => {
    await this.findSampleOrThrow(id);
    // const sample = await this.prisma.sample.findFirst({
    //   where: { id },
    // });

    // if (!sample) {
    //   throw new ApiError(404, "Sample not found");
    // }

    return await this.prisma.sample.update({
      where: { id },
      data: body,
    });
  };

  deleteSample = async (id: number) => {
    await this.findSampleOrThrow(id);
    // const sample = await this.prisma.sample.findFirst({
    //   where: { id },
    // });

    // if (!sample) {
    //   throw new ApiError(404, "Sample not found");
    // }

    await this.prisma.sample.delete({
      where: { id },
    });

    return { message: "delete sample success" };
  };

  // tarok bawah bisa, atas juga bisa
  private async findSampleOrThrow(id: number) {
    const sample = await this.prisma.sample.findFirst({
      where: { id },
    });

    if (!sample) {
      throw new ApiError(404, "Sample not found");
    }

    return sample;
  }
}
