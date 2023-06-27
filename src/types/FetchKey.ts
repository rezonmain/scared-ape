export class FetchKey {
  url: string;
  method?: RequestInit["method"];
  body?: RequestInit["body"];
  constructor(
    url: string,
    method?: RequestInit["method"],
    body?: RequestInit["body"]
  ) {
    this.url = url;
    this.method = method;
    this.body = body;
  }
}
