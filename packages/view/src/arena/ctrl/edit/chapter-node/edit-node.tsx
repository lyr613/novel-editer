// eslint-disable-next-line
import React, { useState, useEffect } from 'react'
import s from './s.module.scss'
import {
    Dialog,
    DialogType,
    DialogFooter,
    PrimaryButton,
    Label,
    Dropdown,
    IDropdownOption,
    TextField,
    IChoiceGroupOption,
    ChoiceGroup,
    DefaultButton,
} from 'office-ui-fabric-react'
import { BehaviorSubject } from 'rxjs'
import { useObservable } from 'rxjs-hooks'
import {
    chapter_list$,
    chapter_focu$,
    book_use$,
    of_node,
    fs_write,
    chapter_save,
    node_focu$,
    find_chapter_list_auto,
} from '@/source'
import { map } from 'rxjs/operators'

// 编辑和删除节的弹窗

/** 修改还是添加 */
export const action_nd$ = new BehaviorSubject<'change' | 'add'>('add')
/** 显示编辑节弹窗 */
export const show_node_edit$ = new BehaviorSubject(false)

export function EditNode() {
    /** 节名 */
    const [name, set_name] = useState('')
    // 节位置
    const [posi, set_posi] = useState<'last' | 'first' | 'insert'>('last')
    // 在id节后
    const [after_nid, set_after_nid] = useState('')
    /** 修改还是添加 */
    const action = useObservable(() => action_nd$, 'add')
    /** 聚焦的书 */
    const book = useObservable(() => book_use$)
    /** 显示编辑节弹窗 */
    const show = useObservable(() => show_node_edit$, false)
    /** 章列表 */
    const cps = useObservable(() => chapter_list$.pipe(map((li) => li.filter((v) => !v.hidden))), [])
    /** 聚焦的章 */
    const cp_focu = useObservable(() => chapter_focu$) ?? cps[0]
    /** 聚焦的节 */
    const node_focu = useObservable(() => node_focu$)

    /** 所在章下拉列表 */
    const cp_sel_opt: IDropdownOption[] = cps.map((cp) => {
        return {
            key: cp.id,
            text: cp.name,
            isSelected: cp.id === cp_focu.id,
        }
    })
    /** 位置单选选项 */
    const posi_opt: IChoiceGroupOption[] = [
        { key: 'first', text: '开头' },
        { key: 'last', text: '末尾' },
        { key: 'insert', text: '在某节后' },
    ]
    /** 所在节后下拉选项 */
    const after_opt: IDropdownOption[] =
        cp_focu?.children.map((nd) => {
            return {
                key: nd.id,
                text: nd.name,
                isSelected: nd.id === after_nid,
            }
        }) ?? []
    useEffect(() => {
        if (!show) {
            // 隐藏时恢复初始状态
            setTimeout(() => {
                set_name('')
                set_posi('last')
            }, 500)
        } else {
            // 修改时获取现有信息
            if (action === 'change' && !!node_focu) {
                set_name(node_focu.name)
                const { children } = cp_focu
                if (children.length === 0) {
                    set_posi('first')
                } else {
                    const fi = children.findIndex((v) => v.id === node_focu.id)
                    if (fi === 0) {
                        set_posi('first')
                    } else if (fi === children.length - 1) {
                        set_posi('last')
                    } else if (fi === -1) {
                        set_posi('last')
                    } else {
                        set_posi('insert')
                        set_after_nid(children[fi - 1].id)
                    }
                }
            }
        }
    }, [show, action, node_focu, cp_focu])
    if (!book) {
        return null
    }
    return (
        <Dialog
            hidden={!show}
            modalProps={{
                isBlocking: true,
            }}
            dialogContentProps={{
                type: DialogType.normal,
                closeButtonAriaLabel: 'Close',
            }}
            onDismiss={() => show_node_edit$.next(false)}
        >
            <TextField
                label="节名"
                value={name}
                onChange={(_, ns) => {
                    const ss = (ns || '').trim()
                    set_name(ss)
                }}
            ></TextField>
            <Label>所在章</Label>
            <Dropdown
                options={cp_sel_opt}
                onChange={(_, opt) => {
                    const arr = chapter_list$.value
                    const id = opt?.key
                    const nf = arr.find((v) => v.id === id)
                    if (nf) {
                        chapter_focu$.next(nf)
                    }
                }}
            ></Dropdown>
            <Label>位置</Label>
            <ChoiceGroup
                options={posi_opt}
                selectedKey={posi}
                onChange={(_, opt) => {
                    const k = opt?.key ?? 'last'
                    set_posi(k as any)
                }}
            ></ChoiceGroup>
            <Dropdown
                options={after_opt}
                onChange={(_, opt) => {
                    const id = (opt?.key ?? '') as string
                    set_after_nid(id)
                }}
            ></Dropdown>
            <DialogFooter>
                <PrimaryButton
                    disabled={!name.length}
                    onClick={async () => {
                        let the_node: null | node = null
                        if (action === 'add') {
                            the_node = of_node()
                            await fs_write('txt', [book.src, 'chapters', the_node.id], '')
                        } else {
                            // 删掉原来的
                            the_node = node_focu!
                            const cp = chapter_list$.value.find((v) => v.id === the_node?.chapter_id)
                            if (cp) {
                                cp.children = cp.children.filter((v) => v.id !== the_node?.id)
                            }
                        }
                        the_node.name = name
                        the_node.chapter_id = cp_focu.id
                        //
                        if (posi === 'last') {
                            cp_focu.children.push(the_node)
                        } else if (posi === 'first') {
                            cp_focu.children.unshift(the_node)
                        } else {
                            const i = cp_focu.children.findIndex((v) => v.id === after_nid)
                            cp_focu.children.splice(i + 1, 0, the_node)
                        }
                        // cp_focu不一定在list里,所以要替换
                        const cfi = chapter_list$.value.findIndex((v) => v.id === cp_focu.id)
                        chapter_list$.value.splice(cfi, 1, cp_focu)

                        await chapter_save()
                        find_chapter_list_auto()
                        show_node_edit$.next(false)
                    }}
                >
                    好
                </PrimaryButton>
                <DefaultButton
                    onClick={() => {
                        show_node_edit$.next(false)
                    }}
                >
                    取消
                </DefaultButton>
            </DialogFooter>
        </Dialog>
    )
}
