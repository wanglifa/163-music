{
    let view =  {
        el: '.page-3',
        $el: null,
        template: `
            <ul class="singer-cover">
                <h4></h4>
            </ul>
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
                this.$el.find('.singer-cover h4').text('最佳匹配')
                let $li = $(`
                <li>
                    <figure><img src="${songs2[0].cover}"></figure>
                    <article><h3>歌手：<span>${songs2[0].singer}</span></h3></article>
                    <i>
                        <svg class="icon" aria-hidden="true">
                            <use xlink:href="#icon-right"></use>
                        </svg>
                    </i>
                </li>
                `) 
                this.$el.find('.singer-cover').append($li)
            }
        },
        renderHistory(data){
            this.$el.find('.history-list').html('')
            data.map(songOrSinger=>{
                let $li = $(`
                    <li class="item">
                        <i>
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#icon-history"></use>
                            </svg>
                        </i>
                        <div class="item-right">
                            <a href="${songOrSinger.href}">${songOrSinger.name}</a>
                            <i class="delete">
                                <svg class="icon" aria-hidden="true">
                                    <use xlink:href="#icon-close1"></use>
                                </svg>
                            </i>
                        </div>
                    </li>
                `)
                this.$el.find('.history-list').append($li)
            })
        }
    }
    let model = {
        data: {
            songs: [],
            songs2: [],
            historyList: []
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
        },
        updataHistoryList(){
            console.log(this.data.historyList)
            localStorage.setItem('search-history',JSON.stringify(this.data.historyList))
        },
    }
    let controller = {
        view: null,
        model: null,
        songs: null,
        current: null,
        $el: null,
        $h4: null,
        init(view, model){
            this.view = view
            this.model = model
            this.view.init()
            this.$el = this.view.$el
            this.remove()
            this.bindEvent()
            this.historyListInit()
        },
        find(current){
            return this.model.find(current.val()).then((songs)=>{
                console.log(songs)
                //获取对应搜索内容成功后，先清空当前的数组
                this.songsInit()
                console.log(this.model.data)
                this.getSearchSong(songs,current)
                return this.model.data
            })
        },
        getSearchSong(songs,current){
            console.log(this.model.data)
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
        },
        singerFindSong(singer){
            this.model.singerFindSong(singer).then((songs)=>{
                songs.map(song=>{
                    this.model.data.songs2.push({...song.attributes})
                })
                this.view.renderSinger(this.model.data)
                this.singerModelCssInitJudge()
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
                            this.repeatData = data
                            this.singerDisplayNorepeat()
                            this.view.render(data)
                        })
                    },400)   
                })
            })
            this.clostBtn()
            this.singerClick()
            this.getFocus()
            this.hotSearch()
            this.inputSubmit()
            this.deleteHistory()
            this.historyJump()
        },
        singerClick(){
            this.$el.on('click','#searchResult > li',(e)=>{
                let current = $(e.currentTarget)
                this.clickSingerAfterInputVal(current,'span')
                this.singerModelCssInitJudge()
                this.getSingerSong(current)
            })
        },
        singerDisplayNorepeat(){
            let {songs} = this.repeatData
            this.noRepeat(songs,'songs')
        },
        noRepeat(lists,key){
            let newStringLists = lists.map(list=>{
                return JSON.stringify(list)
            })
            let newLists = [...new Set(newStringLists)].map(list=>{
                return JSON.parse(list)
            })
            this.model.data[key] = newLists
        },
        singerModelCssInitJudge(){
            this.$h4 = this.$el.find('.singer-cover > h4')
            if(this.$h4.text() !== ''){
                console.log(1)
                this.$h4.css("padding","8px 0")
                this.$h4.parent().css("border-bottom","1px solid rgba(0,0,0,.1)")
            }
        },
        getFocus(){
            this.$el.on('focus','input',(e)=>{
                this.model.data.songs2 = []
                this.view.renderSinger(this.model.data)
            })
        },
        clickSingerAfterInputVal(current,tabName){
            if(tabName){
                this.val = current.find(tabName).text().trim()
            }else{
                this.val = current.trim()
            }
            this.$el.find('input').val(this.val)
            this.removeLabel()
        },
        getSingerSong(current){
            let href = current.find('a').attr('href')
            this.clickSingerAfterInputVal(current,'a')
            this.singerDisplay(href,this.val)
        },
        hotSearch(){
            this.$el.find('.hot').on('click','li',(e)=>{
                let a = $(e.currentTarget).find('a')
                let text = a.text()
                let href = a.attr('href')
                this.clickSingerAfterInputVal($(e.currentTarget),'a')
                this.singerDisplay(href,text)
                this.updataHistoryList({name:text,href})
                this.model.updataHistoryList()
            })
        },
        singerDisplay(href,val){
            this.$el.find('.search-start').addClass('hidden')
            if(href === 'javascript:;'){
                this.$el.find('#searchResult').empty()
                this.singerFindSong(val)
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
                this.removeLabel()
                fn()
            }else{
                console.log(1)
                this.remove()
            }  
        },
        removeLabel(){
            this.$el.find('label').text('')
            this.$el.find('.close').addClass('active')
            this.$el.find('.search-start').addClass('hidden')
        },
        remove(){
            this.renderInput()
            this.$data = this.model.data
            for(let key in this.$data){
                if(key !== 'historyList'){
                    this.$data[key] = []
                }
            }
            this.view.render(this.model.data)
            this.view.renderSinger(this.model.data)
            this.$el.find('#searchResult').html('')
            this.$el.find('.search-start').removeClass('hidden')
        },
        songsInit(){
            this.model.data.songs = []
            this.view.render(this.model.data)
        },
        renderInput(){
            this.$el.find('label').text('搜索歌曲')
            this.$el.find('.close').removeClass('active')
            this.$el.find('input').val('')
        },
        inputSubmit(){
            this.$el.on('submit','.search-wrapper',(e)=>{
                e.preventDefault()
                this.inputVal = this.$el.find('input').val()
                let songs = this.model.data.songs
                if(songs.length && songs.length > 0){
                    songs.map(song=>{
                        if(song.id){
                            location.href = `song.html?id=${song.id}`
                        }else{
                            this.songsInit()
                            this.$el.find('#searchResult').empty()
                            this.singerFindSong(this.inputVal)
                        }
                    })
                }
            })
        },
        historyListInit(){
            this.historyListData = this.model.data.historyList
            if(!localStorage.getItem('search-history')){
                this.model.updataHistoryList()
            }
            this.$data.historyList = JSON.parse(localStorage.getItem('search-history'))
            this.view.renderHistory(this.$data.historyList)
        },
        updataHistoryList(data){
            this.$data.historyList.push(data)
            this.noRepeat(this.$data.historyList,'historyList')
            this.view.renderHistory(this.$data.historyList)
        },
        historyJump(){
            this.$el.find('.history-list').on('click','a',(e)=>{
                let val = $(e.currentTarget).text()
                let href = $(e.currentTarget).attr('href')
                this.singerDisplay(href,val)
                this.clickSingerAfterInputVal(val)
            })
        },
        deleteHistory(){
            this.$el.find('.history-list').on('click','.delete',(e)=>{
                let current = $(e.currentTarget).parent().find('a').text()
                for(let i =0;i<this.$data.historyList.length;i++){
                    if(this.$data.historyList[i].name === current){
                        this.$data.historyList.splice(i,1)
                        this.view.renderHistory(this.$data.historyList)
                        this.model.updataHistoryList()
                        break
                    }
                }
            })
        }
    }
    controller.init(view, model)
}