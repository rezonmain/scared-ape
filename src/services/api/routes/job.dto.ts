interface Job {
  name: string;
  status: string;
}

class JobDto implements Job {
  constructor(private opts: Job) {}
  get name() {
    return this.opts.name;
  }
  get status() {
    return this.opts.status;
  }
}

export { JobDto };
