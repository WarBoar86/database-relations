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
      quantity: products.find(e => e.id === p.id)?.quantity || 0,
      price: p.price,
    }));

    if (listProducts.length === 0) {
      throw new AppError('Products not found');
    }

    const uProducts = listProducts.map(p => ({
      id: p.product_id,
      quantity: p.quantity,
    }));

    const checkedQTDProducts = await this.productsRepository.updateQuantity(
      uProducts,
    );

    if (checkedQTDProducts.length === 0) {
      throw new AppError('Insufiicient products Qtd.');
    }

    const orderProducts = checkedQTDProducts.map(pd => ({
      product_id: pd.id,
      quantity: pd.quantity,
      price: pd.price,
    }));

    // if (orderProducts.length === 0) {
    //   throw new AppError('Empity List');
    // }

    const createOrder = await this.ordersRepository.create({
      customer,
      products: orderProducts,
    });

    return createOrder;
  }
}

export default CreateOrderService;
