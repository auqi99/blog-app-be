import { Router } from "express";
import { injectable } from "tsyringe";
import { SampleController } from "./sample.controller";
import { validateBody } from "../../middlewares/validation.middleware";
import { CreateSampleDTO } from "./dto/create-sample.dto";

@injectable()
export class SampleRouter {
  private router: Router;
  private sampleController: SampleController;

  // constructor ini yang akan dijalankan duluan,
  // disaat membuat instance baru berdasarkan class SampleRouter
  constructor(SampleController: SampleController) {
    this.router = Router();
    this.sampleController = SampleController;
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.get("/", this.sampleController.getSamples);
    this.router.get("/:id", this.sampleController.getSample);
    this.router.post(
      "/",
      validateBody(CreateSampleDTO),
      this.sampleController.createSample
    );
    this.router.patch(
      "/:id",
      validateBody(CreateSampleDTO),
      this.sampleController.updateSample
    );
    this.router.delete("/:id", this.sampleController.deleteSample);
  };

  getRouter() {
    return this.router;
  }
}
