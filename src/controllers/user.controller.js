const User = require('../schema/user.schema');
const Post = require('../schema/post.schema')

module.exports.getUsersWithPostCount = async (req, res) => {
    const getCount = async (id) => {
        return await Post.find({userId: id}).count()
    }

    try {

        var us = await User.find({}, {__v: 0}).count();
        
        const totalDocs = us;
        const page = Number(req.query.page) || 1;
        let prevPage = page - 1;
        let nextPage = page + 1;
        const limit = Number(req.query.limit) || 10;
        const totalPages = totalDocs/limit;
        if(prevPage < 0){
            prevPage = null;
        }
        if(nextPage > totalPages){
            nextPage = null;
        }
        var hasPrevPage = true;
        var hasNextPage = true;
        if(page<2){
            hasPrevPage = false;
        }
        else if(page>totalPages){
            hasNextPage = false;
        } 
        
        var uss = await User.find({}, {__v: 0}).limit(limit).skip(page * limit);
        //TODO: Implement this API
        const updatedUs =await Promise.all(uss.map(async (ele) => {
            return {...ele._doc, posts: await getCount(ele._id) }
        }))
       


        res.status(200).send({
            data: {
                "users": updatedUs,
                "pagination":{
                    "totalDocs": totalDocs,
                    "page": page,
                    "limit": limit,
                    "totalPages": totalPages,
                    "pagingCounter": page,
                    "hasPrevPage": hasPrevPage,
                    "hasNextPage": hasNextPage,
                    "prevPage": prevPage,
                    "nextPage": nextPage

                }
            },

            
        })
    } catch (error) {
        res.send({error: error.message});
    }
}