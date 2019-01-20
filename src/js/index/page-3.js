{
    let view =  {
        el: '.page-3',
        $el: null,
        template: `
            <ul class="singer-cover"></ul>
            <section class="songs">
                <ol id="songs" class="list">
                    <div id="songs-loading" class="square-spin" style="margin: 0 auto; width: 50px;"><div></div></div>
                </ol>
            </section>
        `,
        init(){
            this.$el = $(this.el)
        },
        render(data){
            this.$el.find('#searchResult').html('')
            let {songs}= data
            if(songs.length && songs.length !== 0){
                songs.map(song=>{
                    let {name,id} = song
                    let $li = this.setLi(name)
                    if(id){
                        $li.find('a').attr('href',`song.html?id=${id}`)
                    }else{
                        $li.find('a').attr('href',`javascript:;`)
                    }
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
        renderSinger(data){
            this.$el.find('.singer').html(this.template)
            let {songs2} = data
            console.log(songs2)
            this.renderSingerCover(songs2)
            songs2.map(song=>{
                let $li = $(`
                <li>
                  <h3>${song.name}</h3>
                  <p>
                    <svg class="icon icon-sq">
                      <use xlink:href="#icon-sq"></use>
                    </svg>
                    ${song.singer}
                  </p>
                  <a class="playButton" href="./song.html?id=${song.id}">
                    <svg class="icon icon-play">
                      <use xlink:href="#icon-play"></use>
                    </svg>
                  </a>
                </li>
                `)
                this.$el.find('.singer .list').append($li)

            })
        },
        renderSingerCover(songs2){
            if(songs2.length && songs2.length > 0){
                let $li = $(`
                <li>
                    <figure><img src="${songs2[0].cover}"></figure>
                    <article><h4>歌手：<span>${songs2[0].singer}</span></h4></article>
                    <i>
                        <svg class="icon" aria-hidden="true">
                            <use xlink:href="#icon-right"></use>
                        </svg>
                    </i>
                </li>
                `) 
                this.$el.find('.singer-cover').append($li)
            }
        }
    }
    let model = {
        data: {
            songs: [],
            songs2: []
        },
        find(str){
            var name = new AV.Query('Song')
            name.startsWith('name', str)
            var singer = new AV.Query('Song')
            singer.startsWith('singer', str)
            var query = AV.Query.or(name,singer)
            return query.find()
        },
        singerFindSong(singer){
            var query = new AV.Query('Song');
            query.startsWith('singer', singer)
            return query.find()
        }
    }
    let controller = {
        view: null,
        model: null,
        songs: null,
        current: null,
        $el: null,
        init(view, model){
            this.view = view
            this.model = model
            this.view.init()
            this.$el = this.view.$el
            this.remove()
            this.bindEvent()
        },
        find(current){
            return this.model.find(current.val()).then((songs)=>{
                //获取对应搜索内容成功后，先清空当前的数组
                this.model.data.songs = []
                this.view.render(this.model.data)
                songs.map(song=>{
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
        singerFindSong(singer){
            this.model.singerFindSong(singer).then((songs)=>{
                songs.map(song=>{
                    this.model.data.songs2.push({...song.attributes})
                })
                this.view.renderSinger(this.model.data)
            })
        },
        bindEvent(){
            let timer = null
            this.$el.find('input').on('input',(e)=>{
                this.current = $(e.currentTarget)
                if(timer){
                    clearTimeout(timer)
                }
                this.searchResult(this.current,()=>{
                    timer = setTimeout(()=>{
                        this.find(this.current).then(data=>{
                            this.view.render(data)
                        })
                    },400)   
                })
            })
            this.clostBtn()
            this.singerClick()
            this.getFocus()
        },
        singerClick(){
            this.$el.on('click','#searchResult > li',(e)=>{
                let current = $(e.currentTarget)
                this.val = current.find('span').text().trim()
                this.$el.find('input').val(this.val)
                this.getSingerSong(current)
            })
        },
        getFocus(){
            this.$el.on('focus','input',(e)=>{
                console.log('aaa')
                this.model.data.songs2 = []
                console.log(this.model.data)
                this.view.renderSinger(this.model.data)
            })
        },
        getSingerSong(current){
            let href = current.find('a').attr('href')
            if(href === 'javascript:;'){
                this.$el.find('#searchResult').empty()
                this.singerFindSong(this.val)
            }
        },
        clostBtn(){
            this.$el.find('.close').on('click',(e)=>{
                this.renderInput()
                this.remove()
            })
        },
        searchResult(current,fn){
            if(current.val() !== ''){
                this.$el.find('label').text('')
                this.$el.find('.close').addClass('active')
                fn()
            }else{
                this.remove()
            }  
        },
        remove(){
            this.$el.find('label').text('搜索歌曲')
            this.$el.find('.close').removeClass('active')
            this.$el.find('input').val('')
            this.model.data = {songs:[],songs2:[]}
            this.view.render(this.model.data)
            this.view.renderSinger(this.model.data)
            this.$el.find('#searchResult').html('')
        },
        renderInput(){
            this.$el.find('input').val('')
        }
    }
    controller.init(view, model)
}