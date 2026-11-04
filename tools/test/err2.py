import asyncio,sys
exec(open("act_test.py").read().split("async def main")[0])
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--use-angle=swiftshader","--enable-unsafe-swiftshader","--no-sandbox"])
        pg=await (await b.new_context(viewport={"width":390,"height":700})).new_page(); await pg.context.route("**/*",route)
        errs=[]; pg.on("pageerror",lambda e: errs.append(str(e)[:400]+" | "+(e.stack or "")[:300]))
        await pg.goto(BASE,wait_until="domcontentloaded"); await pg.wait_for_timeout(8000); print(errs[:3]); await b.close()
asyncio.run(main())
