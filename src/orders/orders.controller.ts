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
            items: {
                productId: string;
                quantity: number;
            }[]
    }) {
            return await this.ordersService.createOrder(order);
        }
}
