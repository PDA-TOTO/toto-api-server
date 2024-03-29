import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import User from "./userEntity";

// nullable default is false
@Entity()
export default class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: "account",
    type: "varchar",
    length: "30",
    comment: "계좌",
    nullable: false,
  })
  account: string;

  @Column({ name: "amount", type: "int", comment: "총자산", default: 10000000 })
  amount: number;

  @OneToOne(() => User, (user) => user.account)
  @JoinColumn({ name: "userId" })
  user: User;
}
