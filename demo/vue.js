
/**
 * 创建一个vue类
 */
class Vue {
    constructor(options) {
        // 给vue实例添加属性
        this.$el = options.el
        this.$data = options.data
        this.$methods = options.methods



        // 监视data中的数据
        console.log(this.$data)
        new Observe(this.$data)

        // 把data中的数据挂载到了vm
        this.propx(this.$data)
        // 把methods也挂载到了vm上
        this.propx(this.$methods)
        // 如果指定了el参数，就对el进行解析
        if (this.$el) {
            let c = new Compile(this.$el,this)
            // console.log(c)

        }


    }
    /**
     * 代理
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    propx(data){
        Object.keys(data).forEach(key=>{
            Object.defineProperty(this,key,{
                configurable:true,
                enumerable:true,
                get(){
                    return data[key]
                },
                set(newValue){
                    if(newValue != data[key]){
                        data[key] = newValue
                    }
                }
            })
        })
    }


}