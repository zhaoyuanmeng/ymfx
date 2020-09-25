/*
* @Author: ZhaoYuanDa
* @Date:   2020-09-23 16:52:19
* @Last Modified by:   ZhaoYuanDa
* @Last Modified time: 2020-09-25 21:13:56
*/

/**
 * 用于给data中所有的数据添加getter和setter
 *
 */
class Observe{
    constructor(data){
        this.data = data
        this.walk(this.data)
    }

    /**
     * 核心方法
     * 遍历data中所有的数据，都添加上getter setter
     */
    walk(data){
        if (!data || (typeof data === 'string')) {
            return
        }
        // 遍历对象获取一个key的数组
        Object.keys(data).forEach(key=>{
            console.log(key)
            // 给data对象的key设置setter和getter
            this.defineReactive(data,key,data[key])
            // 递归的把data中的复杂数据都添加get和set
            this.walk(data[key])

        })
    }
    // 定义响应式的数据（数据劫持）
    // value是原来的数据 这个用来get和set中的操作 这时规定内部机制
    // 每一个key 都有一个属于自己的Dep对象 这个对象里面包含了订阅该属性的订阅者
    defineReactive(obj,key,value){
        let that = this
        let dep = new Dep()
        Object.defineProperty(obj,key,{
            configurable:true,
            enumerable:true,
            get(){
                // 这里获取到那个watcher并保存到Dep对象里
                // 这样同一个属性的watcher就都放在一块了
                Dep.target && dep.addSub(Dep.target)
                // console.log('get..........')
                // console.log(dep)
                return value
            },
            set(newvalue){
                // 这里value是引用类型的所以会影响原来的数据
                console.log(value)
                value = newvalue
                that.walk(newvalue)
                console.log('被设置了')
                // 这里需要调用watcher的updata的方法 因为每个数据加了监听 只要他改变就会触发这个set
                // 问题是调用哪个watcher
                // debugger
                // 单个watcher的方式
                // window.watcher.update()


                // 订阅者模式 调用通知的方式
                dep.tongzhi()

            }
        })
    }
}