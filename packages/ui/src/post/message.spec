export const MessageStreamMockup = component$(() => {
    const me = useSignin()
    const inner = useSignal<HTMLDivElement>()
    const outer = useSignal<HTMLDivElement>()
    const lines: string[] = []
    for (let i = 0; i < 100; i++) {
        lines.push(`line ${i}`)
    }
    useVisibleTask$(() => {
        outer.value?.addEventListener('scroll', (e) => {
            //console.log('scroll', outer.value!.scrollTop)
        })
        outer.value!.scrollTop = 400
    })
    return <div ref={outer} class='w-full bg-neutral-800 h-screen overflow-y-auto'>

        <div ref={inner} style={{
            height: '10000px',
            position: 'relative'
        }}>
            <div class=' flex  items-center'>
                <div class='p-1'><Avatar user={me} /></div>
                <SearchBox /><LanguageSelect /><DarkButton /></div>
            {
                lines.map((line, index) => <div style={
                    {
                        position: 'absolute',
                        top: `${index * 20}px`
                    }
                } key={index}>{line}</div>)
            }
        </div>
    </div>
})