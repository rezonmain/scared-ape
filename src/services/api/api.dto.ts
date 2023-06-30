interface IHomeDto {
  greet: string;
}

class HomeDto implements IHomeDto {
  constructor(private opts: IHomeDto) {}
  get greet() {
    return this.opts.greet;
  }
}

export { HomeDto };
