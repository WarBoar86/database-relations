import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export default class CreateOrdersProducts1628415566113
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'orders_products',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'order_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'product_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'quantity',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('orders_products', [
      new TableForeignKey({
        name: 'FK_ORDPRD_ORDER_ID',
        columnNames: ['order_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'orders',
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        name: 'FK_ORDPRD_PRODUCT_ID',
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'products',
        onDelete: 'SET NULL',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('orders_products');
    const foreignKeys = table?.foreignKeys;

    if (foreignKeys) {
      await queryRunner.dropForeignKeys('orders_products', foreignKeys);
    }
    await queryRunner.dropTable('orders_products');
  }
}
