/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiMethodNotAllowedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from '../../common/decorator/roles.decorator';
import { Role } from '../../common/enum/roles.enum';
import { ExceptionDto } from '../../common/exception/exception.dto';
import { IUserJWT } from '../../common/interface/user-jwt.interface';
import { AddToShoppingCartDto } from './dto/request/add-to-shopping-cart.dto';
import { GetShoppingCartQueryParamsDto } from './dto/request/queryParam/getShoppingCart.query-params.dto';
import { UpdateShoppingCartDto } from './dto/request/update-shopping-cart.dto';
import { ResultDto } from './dto/response/result.dto';
import { ShoppingCartService } from './shopping-cart.service';

@ApiBearerAuth()
@ApiTags('Shopping Cart')
@Controller('/shopping-cart')
@ApiMethodNotAllowedResponse({
  description: 'The Application Api Method Not Allowed Response',
  type: ExceptionDto,
})
@ApiInternalServerErrorResponse({
  description: 'The Application Api Internal Server Error Response',
  type: ExceptionDto,
})
export class ShoppingCartController {
  constructor(private readonly shoppingCartService: ShoppingCartService) {}

  /**
   * Adds a new item to the shopping cart.
   *
   * @param createShoppingCartDto - The DTO to create a new shopping cart item.
   * @returns The result of the creation operation.
   */
  @ApiOperation({
    summary: 'Adds one or more applications from the shopping cart.',
    description:
      'Adds one or more applications from the shopping cart, enforcing authentication.',
  })
  @ApiCreatedResponse({
    description: 'The result of the changes to cart.',
    type: ResultDto,
  })
  @Post()
  @Roles(Role.WRITE_PERMIT)
  async addToCart(
    @Req() request: Request,
    @Body() createShoppingCartDto: AddToShoppingCartDto,
  ): Promise<ResultDto> {
    return await this.shoppingCartService.addToCart(createShoppingCartDto);
  }

  /**
   * Retrieves applications within the shopping cart based on the user's permissions and optional query parameters.
   *
   * @param request - The incoming request object, used to extract the user's authentication details.
   * @param getShoppingCartQueryParamsDto - DTO containing optional query parameters for filtering the shopping cart contents.
   * @returns A promise resolved with the applications found in the shopping cart for the authenticated user.
   */
  @ApiOperation({
    summary: 'Returns the applications in the shopping cart.',
    description:
      'Returns one or more applications from the shopping cart, enforcing authentication.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request Response.',
    type: ExceptionDto,
  })
  @ApiOkResponse({
    description: 'The result of the changes to cart.',
    type: ResultDto,
  })
  @Get()
  @Roles(Role.WRITE_PERMIT)
  async getApplicationsInCart(
    @Req() request: Request,
    @Query() getShoppingCartQueryParamsDto: GetShoppingCartQueryParamsDto,
  ) {
    const currentUser = request.user as IUserJWT;
    if (currentUser.idir_user_guid && !currentUser.companyId) {
      const { companyId } = getShoppingCartQueryParamsDto;
      if (!companyId) {
        throw new BadRequestException(
          'companyId is required for all IDIR users.',
        );
      }
      return await this.shoppingCartService.findApplicationsInCart(
        currentUser,
        companyId,
      );
    } else {
      return await this.shoppingCartService.findApplicationsInCart(currentUser);
    }
  }

  /**
   * Retrieves applications within the shopping cart based on the user's permissions and optional query parameters.
   *
   * @param request - The incoming request object, used to extract the user's authentication details.
   * @param getShoppingCartQueryParamsDto - DTO containing optional query parameters for filtering the shopping cart contents.
   * @returns A promise resolved with the applications found in the shopping cart for the authenticated user.
   */
  @ApiOperation({
    summary: 'Returns the applications in the shopping cart.',
    description:
      'Returns one or more applications from the shopping cart, enforcing authentication.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request Response.',
    type: ExceptionDto,
  })
  @ApiOkResponse({
    description: 'The result of the changes to cart.',
    type: ResultDto,
  })
  @Get()
  @Roles(Role.WRITE_PERMIT)
  async getCartCount(
    @Req() request: Request,
    @Query() getShoppingCartQueryParamsDto: GetShoppingCartQueryParamsDto,
  ) {
    const currentUser = request.user as IUserJWT;
    if (currentUser.idir_user_guid && !currentUser.companyId) {
      const { companyId } = getShoppingCartQueryParamsDto;
      return await this.shoppingCartService.getCartCount(
        currentUser,
        companyId,
      );
    } else {
      return await this.shoppingCartService.getCartCount(currentUser);
    }
  }

  /**
   * Removes one or more applications from the shopping cart.
   *
   * @param updateShoppingCartDto - The DTO to update a shopping cart.
   * @returns The result of the removal operation.
   */
  @Delete()
  @Roles(Role.WRITE_PERMIT)
  @ApiOperation({
    summary: 'Removes one or more applications from the shopping cart.',
    description:
      'Removes one or more applications from the shopping cart, enforcing authentication.',
  })
  @ApiOkResponse({
    description: 'The result of the changes to cart.',
    type: ResultDto,
    status: 200,
  })
  async removeFromCart(
    @Req() request: Request,
    @Body() updateShoppingCartDto: UpdateShoppingCartDto,
  ): Promise<ResultDto> {
    const currentUser = request.user as IUserJWT;
    const { applicationIds } = updateShoppingCartDto;
    return await this.shoppingCartService.remove(
      currentUser,
      updateShoppingCartDto,
    );
  }
}
