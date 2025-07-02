import { BadRequestException, Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService){}

    // orderNumber   String      @unique @map("order_number")
    // customerName  String      @map("customer_name")
    // customerEmail String      @map("customer_email")
    // totalAmount   Decimal     @db.Decimal(12, 2) @map("total_amount")
    async createOrder(
        order: { 
            orderNumber: string; 
            customerName: string; 
            customerEmail: string;
            totalAmount: Decimal; 
        }){
            try {
                const existedOrder = await this.prisma.order.findUnique({
                    where: {
                        orderNumber: order.orderNumber
                    }
                });

                if(existedOrder){
                    throw new BadRequestException(`This order already made in ${existedOrder.orderDate}`)
                }

                return await this.prisma.order.create({
                    data: {
                        orderNumber: order.orderNumber,
                        customerName: order.customerName,
                        customerEmail: order.customerEmail,
                        totalAmount: order.totalAmount,
                    }
                })

            } catch (error) {
                throw error;
            }
    }
}
