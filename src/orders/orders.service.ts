import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService){}

    async createOrder(
        order: { 
            orderNumber: string; 
            customerName: string; 
            customerEmail: string;
            items: {
                productId: string;
                quantity: number;
            }[] 
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

                let totalAmountPrice = new Decimal(0)   //total harga order semuanya
                const orderItemsToConnect: any[] = []   //array penyimpanan item order yang ada sekalian dibuat dalam transaksi
                const productsUpdate: { productId: string; stockQuantity: number }[] = []   //array penyimpanan data utk update stock produk

                const result = await this.prisma.$transaction(async (prisma) => {
                    for(const item of order.items){
                        const product = await prisma.product.findUnique({
                            where: { id: item.productId }
                        });

                        if(!product){
                            throw new NotFoundException(`Product with ID ${item.productId} not found. Please enter the right ID`);
                        }

                        if(product.stockQuantity < item.quantity){
                            throw new BadRequestException(`Product's stock not enough for this transaction.`)
                        }

                        const pricePerUnit = new Decimal(product.price);
                        totalAmountPrice = totalAmountPrice.plus(pricePerUnit.times(item.quantity));

                        orderItemsToConnect.push({
                            product: { connect: { id: item.productId } },
                            quantity: item.quantity,
                            pricePerUnit: pricePerUnit
                        });

                        productsUpdate.push({
                            productId: item.productId,
                            stockQuantity: product.stockQuantity - item.quantity
                        });
                    }

                    const newOrder = await prisma.order.create({
                        data: {
                            orderNumber: order.orderNumber,
                            customerName: order.customerName,
                            customerEmail: order.customerEmail,
                            totalAmount: totalAmountPrice,
                            items: { 
                                create: orderItemsToConnect
                            }
                        },
                        include: {
                            items: {
                                include: { product: true }
                            }
                        }
                    });

                    for(const update of productsUpdate){
                        await prisma.product.update({
                            where: { id: update.productId },
                            data: {
                                stockQuantity: update.stockQuantity
                            }
                        })
                    }
                    return newOrder;
                })

                return result;
            } catch (error) {
                throw error;
            }
    }

}
