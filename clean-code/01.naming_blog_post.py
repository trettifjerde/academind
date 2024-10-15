from datetime import datetime

# class Entity:
#     def __init__(self, title, description, ymdhm):
#         self.title = title
#         self.description = description
#         self.ymdhm = ymdhm


# def output(item):
#     print('Title: ' + item.title)
#     print('Description: ' + item.description)
#     print('Published: ' + item.ymdhm)


# summary = 'Clean Code Is Great!'
# desc = 'Actually, writing Clean Code can be pretty fun. You\'ll see!'
# new_date = datetime.now()
# publish = new_date.strftime('%Y-%m-%d %H:%M')

# item = Entity(summary, desc, publish)

# output(item)

class BlogPost:
    def __init__(self, title, description, date_published):
        self.title = title
        self.description = description
        self.date_published = date_published

    def print(self):
        print('Title: ' + self.title)
        print('Description: ' + self.description)
        print('Published: ' + self.date_published)


title = 'Clean Code Is Great!'
description = 'Actually, writing Clean Code can be pretty fun. You\'ll see!'
date_published = datetime.now().strftime('%Y-%m-%d %H:%M')

post = BlogPost(title, description, date_published)
post.print()