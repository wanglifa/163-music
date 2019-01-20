{
    let view =  {
        el: '.page-3',
        $el: null,
        init(){
            this.$el = $(this.el)
        },
        render(data){
            this.$el.find('#searchResult').html('')
            console.log(this.$el.find('#searchResult').html())
            let {songs}= data
            console.log(songs)
            if(songs.length && songs.length !== 0){
                songs.map(song=>{
                    console.log(1)
                    let {name,id} = song
                    let $li = this.setLi(name)
                    if(id){
                        $li.find('a').attr('href',`song.html?id=${id}`)
                    }else{
                        $li.find('a').attr('href',`singer.html?name=${name}`)
                    }
                    console.log($li)
                    this.$el.find('#searchResult').append($li)
                })
            }else{
                let $li = $(`<li>没有结果</li>`)
                this.$el.find('#searchResult').append($li)
            }
            
        },
        setLi(name){
            $li = $(`
            <li>
                <a>
                    <i class="i-search">
                        <svg class="icon" aria-hidden="true">
                            <use xlink:href="#icon-search"></use>
                        </svg>
                    </i>
                    <span>${name}</span>
                </a>
            </li>`)
            return $li
        },
        show(){
            this.$el.addClass('active')
        },
        hide(){
            this.$el.removeClass('active')
        }
    }
    let model = {
        data: {
            songs: []
        },
        find(str){
            var name = new AV.Query('Song')
            name.startsWith('name', str)
            var singer = new AV.Query('Song')
            singer.startsWith('singer', str)
            var query = AV.Query.or(name,singer)
            return query.find()
        },
    }
    let controller = {
        view: null,
        model: null,
        songs: null,
        init(view, model){
            this.view = view
            this.model = model
            this.view.init()
            this.bindEvent()
            this.bindEventHub()
        },
        find(current){
            return this.model.find(current.val()).then((songs)=>{
                //获取对应搜索内容成功后，先清空当前的数组
                this.model.data.songs = []
                this.view.render(this.model.data)
                songs.map(song=>{
                    console.log(3)
                    let {singer,name,id} = song.attributes
                    this.songs = this.model.data.songs
                    let addSinger = {name:singer}
                    let addName = {id,name}
                    if(singer.indexOf(current.val()) > -1){
                        this.songs.push(addSinger)
                    }else{
                        this.songs.push(addName)
                    }
                    
                })
                return this.model.data
            })
        },
        bindEvent(){
            let $el = this.view.$el
            let timer = null
            $el.find('input').on('input',(e)=>{
                let current = $(e.currentTarget)
                if(timer){
                    clearTimeout(timer)
                }
                this.searchResult(current,$el,()=>{
                    timer = setTimeout(()=>{
                        this.find(current).then(data=>{
                            this.view.render(data)
                        })
                    },400)   
                })
            })
        },
        searchResult(current,$el,fn){
            if(current.val() !== ''){
                $el.find('label').text('')
                $el.find('.close').addClass('active')
                fn()
            }else{
                $el.find('label').text('搜索歌曲')
                $el.find('.close').removeClass('active')
                $el.find('#searchResult').html('')
            }  
        },
        bindEventHub(){
            window.eventHub.on('select',(tabName)=>{
                if(tabName === 'page-3'){
                    this.view.show()
                }else{
                    this.view.hide()
                }
            })
        }
    }
    controller.init(view, model)
}