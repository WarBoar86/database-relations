import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    // TODO
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer not found');
    }
    const listProducts = (
      await this.productsRepository.findAllById(products)
    ).map(p => ({
      product_id: p.id,
      quantity: p.quantity,
      price: p.price,
    }));

    if (listProducts.length <= 0) {
      throw new AppError('Products not found');
    }

    const checkedQTDProducts = await this.productsRepository.updateQuantity(
      listProducts.map(p => ({ id: p.product_id, quantity: p.quantity })),
    );

    if (checkedQTDProducts.length !== listProducts.length) {
      throw new AppError('Insuficient products quantity');
    }

    const orderProducts = checkedQTDProducts.map(pd => ({
      product_id: pd.id,
      quantity: pd.quantity,
      price: pd.price,
    }));

    const createOrder = await this.ordersRepository.create({
      customer,
      products: orderProducts, // listProducts,
    });

    return createOrder;
  }
}

export default CreateOrderService;
