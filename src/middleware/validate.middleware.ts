import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodType } from "zod"; // Zod v4 uses ZodType for schemas

export const validate = (schema: ZodType) => {
    console.log("middleware runned");
    
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                console.log("Zod validation failed",error.format()); 
                
                res.status(400).json({
                    status: "failed",
                    message: error.message || "validation Error",
                    errors: error.issues.map((err) => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
                return;
            }
            next(error);
        }
    };
};
