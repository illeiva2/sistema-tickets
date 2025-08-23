import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { AuthenticatedRequest } from "../middleware/auth";
import { loginSchema, refreshTokenSchema } from "../validations/auth";
import { validate } from "../middleware/validation";
import { z } from "zod";

export class AuthController {
  static login = [
    validate(z.object({ body: loginSchema })),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email, password } = req.body;
        const result = await AuthService.login(email, password);
        
        res.json({
          success: true,
          data: result,
        });
      } catch (error) {
        next(error);
      }
    },
  ];

  static refreshToken = [
    validate(z.object({ body: refreshTokenSchema })),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { refreshToken } = req.body;
        const result = await AuthService.refreshToken(refreshToken);
        
        res.json({
          success: true,
          data: result,
        });
      } catch (error) {
        next(error);
      }
    },
  ];

  static me = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Usuario no autenticado",
          },
        });
      }

      const user = await AuthService.getCurrentUser(req.user.id);
      
      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };
}
