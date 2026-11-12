import{j as e}from"./r3f-BjRlvwza.js";const c={title:"SSE 明明在推流，前端却收到一坨 JSON",date:"2026-07-30",tags:["FastAPI","流式 API","中间件"],excerpt:"全局统一响应中间件默认假设「响应是完整 JSON」，把事件流整个消费掉再包一层信封。引入 SSE / WS，必须留显式逃生舱。"};function t(s){const n={blockquote:"blockquote",code:"code",h2:"h2",p:"p",pre:"pre",strong:"strong",...s.components};return e.jsxs(e.Fragment,{children:[e.jsxs(n.blockquote,{children:[`
`,e.jsxs(n.p,{children:["2026 年 7 月 30 日，AI 导购接口已经改成 ",e.jsx(n.code,{children:"StreamingResponse"})," + ",e.jsx(n.code,{children:"text/event-stream"}),"，后端日志里流也在一块块往外推，前端却收到一坨 ",e.jsx(n.code,{children:'{"code":"0","data":...,"message":"success"}'}),"。流式协议被一个「好心」的中间件整个吃掉了。"]}),`
`]}),`
`,e.jsx(n.h2,{children:"现象"}),`
`,e.jsxs(n.p,{children:["浏览器拿到的不是事件流，而是统一响应信封；或者中间件读 body、改写 ",e.jsx(n.code,{children:"Content-Length"})," 之后，流式连接直接异常，日志里冒出 content-length 相关的报错。"]}),`
`,e.jsxs(n.p,{children:["根因不在 SSE 路由，在",e.jsxs(n.strong,{children:["全局「统一响应」中间件对所有 ",e.jsx(n.code,{children:"/api/"})," 响应做了 JSON 包装，没把流式响应排除出去"]}),"。"]}),`
`,e.jsx(n.h2,{children:"问题代码"}),`
`,e.jsx(n.p,{children:"中间件会消费整段 body，再包一层成功信封："}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`# app/core/middleware/response.py（核心逻辑）

async def unified_response(request: Request, call_next):
    response = await call_next(request)

    # 若这里没有跳过 is_stream，就会把 SSE 当普通 JSON 包起来
    body = b""
    async for chunk in response.body_iterator:
        body += chunk

    headers = dict(response.headers)
    headers.pop("content-length", None)

    data = json.loads(body) if body else None
    return JSONResponse(
        content={"code": "0", "data": data, "message": "success"},
        status_code=response.status_code,
        headers=headers,
    )
`})}),`
`,e.jsx(n.p,{children:"SSE 路由若忘记打标，就正好撞上去："}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`@router.get("/initialize/{product_id}")
async def initialize_conversation(...):
    # 缺少：request.state.is_stream = True
    async def event_stream():
        async for chunk in svc.initialize(...):
            yield f"data: {chunk}\\n\\n"
    return StreamingResponse(event_stream(), media_type="text/event-stream")
`})}),`
`,e.jsx(n.h2,{children:"根因"}),`
`,e.jsxs(n.p,{children:["统一响应中间件的职责是「业务 JSON → 标准信封」，这个抽象默认了一个前提：",e.jsx(n.strong,{children:"响应是一次性的、完整的 JSON body"}),"。"]}),`
`,e.jsxs(n.p,{children:["但 SSE / WebSocket 升级路径不是。中间件 ",e.jsx(n.code,{children:"async for"})," 把迭代器读完，流被消费光；再 ",e.jsx(n.code,{children:"json.loads"})," + ",e.jsx(n.code,{children:"JSONResponse"}),"，媒体类型和协议一起被毁掉；前端按 EventStream 解析必然失败。三步里没有任何一步抛异常，所以特别容易看成「前端解析写错了」。"]}),`
`,e.jsx(n.h2,{children:"正确写法"}),`
`,e.jsx(n.p,{children:"两步，缺一不可。中间件入口留出逃生舱："}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`async def unified_response(request: Request, call_next):
    response = await call_next(request)

    if (
        not request.url.path.startswith("/api/")
        or getattr(request.state, "exception_handled", False)
        or getattr(request.state, "is_stream", False)  # 关键
        or request.method == "HEAD"
        or response.status_code in _NO_BODY_STATUS
    ):
        return response

    # ... 再包装普通 JSON
`})}),`
`,e.jsx(n.p,{children:"流式入口显式打标："}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`# app/api/ai_sse.py

@router.get("/initialize/{product_id}")
async def initialize_conversation(request: Request, ...):
    request.state.is_stream = True
    ...
    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.post("/message")
async def send_message(request: Request, ...):
    request.state.is_stream = True
    ...
`})}),`
`,e.jsx(n.p,{children:"WebSocket 路由同样要避免被「读 body + 再包装」的逻辑碰到。"}),`
`,e.jsxs(n.p,{children:["还有个附带修正：对 ",e.jsx(n.code,{children:"status_code >= 400"})," 的错误响应也不该再包一层 ",e.jsx(n.code,{children:'code: "0"'}),"，否则客户端会收到「HTTP 错了但业务码成功」的双信号，比不包装更难排查。"]}),`
`,e.jsx(n.h2,{children:"可复用结论"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"横切中间件默认假设「响应是完整 JSON」。"})," 一旦引入 SSE / WS，就必须有显式逃生舱——flag、路径白名单，或按 ",e.jsx(n.code,{children:"media_type"})," 判断，选哪种都行，但不能没有。"]}),`
`,e.jsxs(n.p,{children:["写流式接口时，第一行业务代码往往就是 ",e.jsx(n.code,{children:"is_stream = True"}),"。这句话现在会条件反射般地出现在我的路由里。"]})]})}function a(s={}){const{wrapper:n}=s.components||{};return n?e.jsx(n,{...s,children:e.jsx(t,{...s})}):t(s)}export{a as default,c as frontmatter};
