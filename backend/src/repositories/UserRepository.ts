import User, { IUser } from '../models/User';
import { UserData } from '../types';

/**
 * Repository Pattern for User database operations
 */
class UserRepository {
  /**
   * Find user by email
   * @param email - User email
   * @returns Promise<IUser | null> User object
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).exec();
  }

  /**
   * Find user by ID
   * @param id - User ID
   * @returns Promise<IUser | null> User object
   */
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).exec();
  }

  /**
   * Create a new user
   * @param userData - User data
   * @returns Promise<IUser> Created user
   */
  async create(userData: UserData): Promise<IUser> {
    const user = new User(userData);
    return user.save();
  }
}

// Singleton Pattern
export default new UserRepository();

