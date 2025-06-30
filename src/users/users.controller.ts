import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get(':id/favorites')
  getFavorites(@Param('id') id: string) {
    return this.usersService.getFavoriteProperties(id);
  }

  @Post(':id/favorites/:propertyId')
  addFavorite(
    @Param('id') userId: string,
    @Param('propertyId') propertyId: string,
  ) {
    return this.usersService.addFavoriteProperty(userId, propertyId);
  }

  @Delete(':id/favorites/:propertyId')
  removeFavorite(
    @Param('id') userId: string,
    @Param('propertyId') propertyId: string,
  ) {
    return this.usersService.removeFavoriteProperty(userId, propertyId);
  }

  @Post('find-or-create')
  findOrCreate(@Body() userData: CreateUserDto) {
    return this.usersService.findOrCreate(userData);
  }
}