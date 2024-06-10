import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { LoginDto, SignupDto } from './dto/user.dto';

@Controller('')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('api/regisrer')
  async create(@Body() body: SignupDto) {
    console.log("user -> controller -> create - > user");
    console.table(body);
    return await this.usersService.create(body);
  }

  @Post('api/login')
  async login(@Body() body: LoginDto) {
    console.log("user -> controller -> login");
    console.table(body);
    return await this.usersService.login(body);
  }

  @Post('api/forget-password')
  async forgetPassword(@Body() body: LoginDto) {
    console.log("user -> controller -> login");
    console.table(body);
    return await this.usersService.login(body);
  }

  @Post('api/reset-password')
  async resetPassword(@Body() body: LoginDto) {
    console.log("user -> controller -> login");
    console.table(body);
    return await this.usersService.login(body);
  }
}
