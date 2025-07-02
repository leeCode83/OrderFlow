import { Body, Controller, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Decimal } from '@prisma/client/runtime/library';

@Controller('orders')
export class OrdersController {
    constructor(private ordersService: OrdersService){}

    @Post()
    async createOrder(@Body() 
        order: {
            orderNumber: string;
            customerName: string;
            customerEmail: string;
            totalAmount: Decimal;
    }) {
            return await this.ordersService.createOrder(order);
        }
}
