import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { validateDataSentFromRequest } from "../../middlewares/validateTheDataSentMiddleware";
import { UserRepositoryInMemory } from "../../repositories/in-memory/UserRepositoryInMemory";
import { UserLoginService } from "../../services/userServices/UserLoginService";
import * as yup from "yup";
import { UserModel } from "../../entities/User";

interface IbodyRequest extends Omit<UserModel, "id" | "name">{};

export const validateUserLoginServiceSentSchema = validateDataSentFromRequest(
  (getSchema) => ({
    body: getSchema<IbodyRequest>(
      yup.object().shape({
        email: yup.string().required().min(6),
        password: yup.string().required().min(6),
      })
    ),
  })
);

class UserLoginServiceController {
  constructor(private userLoginService: UserLoginService) {};

  async handle(request: Request, response: Response): Promise<Response> {
    const { email, password } = request.body;

    try {
      const loggedInUser = await this.userLoginService.execute({
        email,
        password,
      });

      return response
        .status(StatusCodes.OK)
        .send(loggedInUser);

    } catch (err: any) {

      return response
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: err.message || "Internal server error." });
    };
  };
};
//Exporting to be used in application routes
export const userLoginServicecontroller = new UserLoginServiceController(
  new UserLoginService(new UserRepositoryInMemory())
);
