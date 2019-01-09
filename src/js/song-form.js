
{
    let view = {
        el: '.page > main',
        template: `
            <form class="form">
              <div class="row">
                <label>
                  歌名
                </label>
                <input name="name" type="text" value="__name__">
              </div>
              <div class="row">
                <label>
                  歌手
                </label>
                <input name="singer" type="text" value="__singer__">
              </div>
              <div class="row">
                <label>
                  外链
                </label>
                <input name="url" type="text" value="__url__">
              </div>
              <div class="row actions">
                <button type="submit">保存</button>
              </div>
            </form>
        `,
        render(data = {}){
          let placheholder = ['name','singer','url','id']
           html = this.template
           placheholder.map((string)=>{
             html = html.replace(`__${string}__`,data[string] || '')
           })
          $(this.el).html(html)
          if(data.id){
            $(this.el).prepend('<h1>编辑歌曲</h1>')
          }else{
            $(this.el).prepend('<h1>新建歌曲</h1>')
          }
        },
        reset(){
          this.render({})
        }
    }
    let model = {
      data: {
        name: '',singer: '',url: '',id: ''
      },
      create(data){
        var Song = AV.Object.extend('Song')
        var song = new Song()
        //这里设置name singer url的值等于你传进来的data的值
        song.set('name',data.name)
        song.set('singer',data.singer)
        song.set('url',data.url)
        return song.save().then((newSong)=>{
          let {id, attributes} = newSong
          return Object.assign(this.data,{
            id,
            ...attributes
          })
        }).catch((error)=>console.log(error))
      },
      update(data){
      var song = AV.Object.createWithoutData('Song', this.data.id)
      // 修改属性
      song.set('name', data.name)
      song.set('singer', data.singer)
      song.set('url', data.url)
      // 保存到云端
      return song.save()
      }
    }
    let controller = {
        view: null,
        model: null,
        $el: null,
        init(view, model){
            this.view = view
            this.model = model
            this.$el = $(this.view.el)
            this.view.render(this.model.data)
            this.bindEvent()
            this.bindEventHub()
        },
        create(){
          let info = ['name','singer','url','id']
          let data = {}
          info.map((name)=>{
            data[name] = this.$el.find(`[name=${name}]`).val()
          })
          this.model.create(data).then((data)=>{
            let string = JSON.stringify(data)
            let object = JSON.parse(string)
            window.eventHub.emit('create',object)
            this.view.reset()
          })
        },
        update(){
          let info = ['name','singer','url','id']
          let data = {}
          info.map((name)=>{
            data[name] = this.$el.find(`[name=${name}]`).val()
          })
          //执行更新方法，成功后拿到数据把当前的model里的data更改为song里的attributes，然后触发更新事件，把data传进去
          return this.model.update(data).then((song)=>{
            Object.assign(this.model.data,song.attributes)
            window.eventHub.emit('update',JSON.parse(JSON.stringify(this.model.data)))
          })
        },
        bindEvent(){
          this.$el.on('submit','.form',(e)=>{
            e.preventDefault()
            //如果数据库里有这个id说明已经存在点击按钮不会去创建而是去保存，否则就去创建
            if(this.model.data.id){
              this.update()
            }else{
              this.create()
            }
          })
        },
        bindEventHub(){
          window.eventHub.on('select',(data)=>{
            this.model.data = data
            this.view.render(this.model.data)
          })
          window.eventHub.on('new',(data)=>{
            //如果数据库里有这首歌曲的id，那么就清空
            if(this.model.data.id){
              this.model.data = {name: '',singer: '',url: '',id: ''}
            }else{
              //否则就把你当前的data赋值给this.model.data，又因为有可能没有data，
              //所以需要在没data的时候就等于this.model.data
              this.model.data = data || this.model.data
              //Object.assign(this.model.data,data)
            }
            this.view.render(this.model.data)
          })
        }
    }
    controller.init.call(controller,view, model)
    
}
