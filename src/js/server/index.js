import "babel-polyfill";
import koa from "koa";
import koaStatic from "koa-static";
import koaBody from "koa-body";

const app = koa();

app.use(function *(next){
	const requestStart = new Date();
	yield next;
	console.log(`${this.request.method} ${this.request.path} - ${this.status} - ${(new Date()).getTime() - requestStart.getTime()}ms`);
});
app.use(koaStatic("public"));
app.use(koaBody({jsonLimit: 100*1000}));
const port = 8000;
app.listen(port);
console.log(`Running on port ${port}`);

