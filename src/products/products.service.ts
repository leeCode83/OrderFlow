import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService){}

    async createProduct(product: {
        name: string; 
        sku: string; 
        description: string; 
        price: Decimal; 
        stockQuantity: number
    }){
        try {
            const existedProduct = await this.prisma.product.findUnique({
                where: { sku: product.sku }
            });

            if (existedProduct) {
                throw new BadRequestException(`This product already in database. The product's id is ${existedProduct.id}`);
            }

            const newProduct = await this.prisma.product.create({
                data: {
                    name: product.name,
                    sku: product.sku,
                    description: product.description,
                    price: product.price,
                    stockQuantity: product.stockQuantity
                }
            });

            return {
                id: newProduct.id,
                name: newProduct.name,
                stock: newProduct.stockQuantity,
                price: newProduct.price
            }
        } catch (error) {
            throw error;
        }
    }

    async getProductById(productId: string){
        try {
            const product = await this.prisma.product.findUnique({
                where: { id: productId }
            });

            if (!product) {
                throw new NotFoundException("Product not found.");
            }

            return product;
        } catch (error) {
            throw error;
        }
    }

    async getAllProducts(){
        try {
            return await this.prisma.product.findMany({
                select: {
                    id: true,
                    name: true,
                    price: true,
                    stockQuantity: true,
                    sku: true
                }
            })  
        } catch (error) {
            throw error;
        }
    }

    async deleteProductById(productId: string){
        try {
            const product = await this.prisma.product.findUnique({
                where: { id: productId }
            });

            if (!product) {
                throw new NotFoundException("Product not found.");
            }

            return await this.prisma.product.delete({
                where: { id: productId }
            });
        } catch (error) {
            throw error;
        }
    }

    async updateProductById(
        productId: string,
        productUpdate: {
            name?: string;
            sku?: string;
            description?: string;
            price?: Decimal;
            stockQuantity?: number
        }
    ){
        try {
            const product = await this.prisma.product.findUnique({
                where: { id: productId }
            });

            if (!product) {
                throw new NotFoundException("Product not found.");
            }

            return await this.prisma.product.update({
                where: { id: productId },
                data: {
                    name: productUpdate.name,
                    sku: productUpdate.sku,
                    description: productUpdate.description,
                    price: productUpdate.price,
                    stockQuantity: productUpdate.stockQuantity
                }
            })

        } catch (error) {
            throw error
        }
    }



}
