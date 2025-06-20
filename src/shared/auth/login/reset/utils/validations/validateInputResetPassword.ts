import { errorMessages } from '../../../../errors/auth.errors';

export const validateInputresetPassword = (usernameOrEmail: string, randomPassword: string, newPassword: string): string[] => {
    const errors: string[] = [];
    if (!usernameOrEmail ||!randomPassword || !newPassword) {
        errors.push(errorMessages.requiredFields);
    }
    return errors;
};
