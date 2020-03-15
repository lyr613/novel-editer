// eslint-disable-next-line
import React, { useState, useEffect, useRef, useMemo } from 'react'
import s from './s.module.scss'
import { book_focu$, npc_find$, find_chapter_list_auto } from '@/source'
import { next_router } from '@/function/router'
import ChapterNode from './chapter-node'
import Outline from './outline'
import Workspace from './workspace'
import Shard from './shard'
import { Screen$ } from '@/subscribe'
import DragLine from '@/component/drag-line'
import { useObservable } from 'rxjs-hooks'
import { shallowCopy } from '@/rx/shallow-copy'
import { table_list_find$ } from '@/source/table'
import { editer_setting$ } from '@/subject'

/** 编辑文本页 */
export default function Edit() {
    const box_ref = useRef<null | HTMLDivElement>(null)
    const [w, set_w] = useState(0)
    const [h, set_h] = useState(0)

    useEffect(() => {
        // 计算各模块的宽高
        const dom = box_ref.current
        if (!dom) {
            return
        }

        const ob = Screen$.pipe().subscribe(() => {
            set_w(dom.clientWidth)
            set_h(dom.clientHeight)
        })
        return () => ob.unsubscribe()
    }, [])

    useEffect(() => {
        npc_find$.next()
        find_chapter_list_auto()
        table_list_find$.next()
    }, [])

    if (!book_focu$.value) {
        next_router('shelf')
        return null
    }
    return (
        <div className={s.Edit} ref={box_ref}>
            {w ? <Inset w={w} h={h} /> : null}
        </div>
    )
}

interface inset {
    w: number
    h: number
}
function Inset(p: inset) {
    const Eset = useObservable(() => editer_setting$.pipe(shallowCopy()))
    if (!Eset) {
        return null
    }
    const lens = Eset.editer.outline_layout

    return (
        <>
            <ChapterNode w={lens.width} h={p.h - lens.height} />
            <Outline w={lens.width} h={lens.height} />
            <Workspace w={p.w - lens.width} h={p.h - 30} />
            <Shard w={p.w - lens.width} h={30} />
            <DragLine
                datum="left"
                on_drag={drag_w}
                min={140}
                max={600}
                style={{
                    left: lens.width + 'px',
                }}
            ></DragLine>
            <DragLine
                datum="bottom"
                on_drag={drag_h}
                min={30}
                max={600}
                style={{
                    width: lens.width + 'px',
                    bottom: lens.height + 'px',
                }}
            ></DragLine>
        </>
    )
}

function drag_w(n: number) {
    const eset = editer_setting$.value
    const wh = eset.editer.outline_layout
    wh.width = n
    editer_setting$.next(eset)
}
function drag_h(n: number) {
    const eset = editer_setting$.value
    const wh = eset.editer.outline_layout
    wh.height = n
    editer_setting$.next(eset)
}
