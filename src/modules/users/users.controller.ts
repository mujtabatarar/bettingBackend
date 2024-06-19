import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { ForgotPasswordDto, IdDto, LoginDto, ResetPasswordDto, SignupDto, UpdateUserDto, UserFilterDto } from './dto/user.dto';

@Controller('api')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('user/register')
  async create(@Body() body: SignupDto) {
    console.log("user -> controller -> create - > user");
    console.table(body);
    return await this.usersService.create(body);
  }

  @Post('user/login')
  async login(@Body() body: LoginDto) {
    console.log("user -> controller -> login");
    console.table(body);
    return await this.usersService.login(body);
  }

  @Post('user/update/:id')
  async update(@Body() body: UpdateUserDto, @Param('id') id: string) {
    console.log("user -> controller -> update");
    console.table(body);
    return await this.usersService.update(id, body);
  }

  @Post('user/forget-password')
  async forgetPassword(@Body() body: ForgotPasswordDto) {
    console.log("user -> controller -> for password");
    console.table(body);
    return await this.usersService.forgotPassword(body);
  }

  @Post('user/reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    console.log("user -> controller -> resetPassword");
    console.table(body);
    return await this.usersService.resetPassword(body);
  }

  @Post('admin/user/find-all')
  async findAllUsers(@Body() filterDto: UserFilterDto, @Request() req: any) {
    const adminUser = req.user;
    return this.usersService.findAllUsers(filterDto, adminUser);
  }

}
