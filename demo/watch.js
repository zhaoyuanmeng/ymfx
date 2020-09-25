/*
* @Author: ZhaoYuanDa
* @Date:   2020-09-23 16:52:11
* @Last Modified by:   ZhaoYuanDa
* @Last Modified time: 2020-09-25 21:14:16
*/

/**
 * 功能是将compile的解析结果与observe所观察的对象连接起来，建立联系，也就是在observe观察到对象
 * 数据变化时，接收通知，同时更新dom
 */

class Watcher{
    /**
     * vm:当前的vue实例
     * attrval:data中数据的名字
     * 一旦数据改变就调用cp
     * 订阅者和观察者模式是为了解决 多个watcher不能共用一个全局变量的问题
     */
    constructor(vm,attrval,cb){
        this.vm = vm
        this.attrval = attrval
        this.cb = cb

         // *dep 如何关联 watcher
        // watcher如何被收集起来
        // this表示的就是新创建的watcher对象
        // Dep是类名 Dep.target是给这个类提供了这个属性
        Dep.target = this


        // 怎么知道数据发生改变（通过observe中的set 调用update方法，然后触发回调函数给complie）
        // 需要把attrval的旧值存起来
        // 这里就会触发监听数据的get方法 把这次的watcher放进去
        this.oldValue = this.getVMValue(vm,attrval)

        // 然后清空Dep.target 为下次做准备
        Dep.target = null
    }

    // 对外暴露的一个方法，用于更新方法，更新页面
    // 数据改变就更新
    update(){
        //对比数据是否发生变化 发生改变就调用cb
        let oldValue = this.oldValue
        let newValue = this.getVMValue(this.vm,this.attrval)
        if (oldValue != newValue) {
            this.cb(newValue,oldValue)
        }
    }

    // 用于获取vm中的数据
    getVMValue(vm,attrval){
        let data = vm.$data
        attrval.split('.').forEach(key=>{
           data = data[key]
        })
        return data
    }
}

/**
 * dep对象用于管理所有的订阅者和通知这些订阅者
 */
class Dep{
    constructor(){
        // 用于管理订阅者
        this.subs = []
    }
    // 添加订阅者
    addSub(watcher){
        this.subs.push(watcher)
    }

    // 通知订阅者
    tongzhi(){
        // 遍历所有的订阅者
        this.subs.forEach(sub=>{
            sub.update()
        })
    }
}