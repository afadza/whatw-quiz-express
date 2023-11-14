import { Repository } from "typeorm";
import { User } from "../entity/User";
import { AppDataSource } from "../data-source";
import { Request, Response } from "express";
import { createUserSchema } from "../utils/validator/Validate";

class UserServices {
	private readonly UserRepository: Repository<User> =
		AppDataSource.getRepository(User);

	async register(req: Request, res: Response): Promise<Response> {
		try {
			const { fullname, email } = req.body;
			const { error, value } = createUserSchema.validate({ fullname, email });
			if (error) {
				return res.status(400).json({ error: error.details[0].message });
			}

			//? check Email
			const checkEmail = await this.UserRepository.count({
				where: {
					email: value.email,
				},
			});
			if (checkEmail > 0) {
				return res.status(400).json({ error: "Email already exist" });
			}

			const user = this.UserRepository.create({
				fullname: value.fullname,
				email: value.email,
			});

			const createUser = await this.UserRepository.save(user);
			return res.status(200).json(createUser);
		} catch (error) {
			return res.status(400).json({ error });
		}
	}
}

export default new UserServices();
