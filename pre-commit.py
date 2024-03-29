#!/usr/bin/python
# -*- coding: UTF-8 -*-
# =================================================
# Description: 侯爷Blog自动化脚本
#               1. 更新 index.md
#               2. 创建相关 issue 用于启用评论
# Version: 1.0
# Lisence: MIT
# Author: houfukude@gmail.com
# Blog: https://blog.houfukude.tk/
# Usage:
# 	./pre-commit.py
# Based on https://gist.github.com/JeffPaine/3145490 with tweaks
# Based on https://github.com/zhaoolee/WordPressXMLRPCTools
# =================================================
import argparse
import datetime
import json
import os
import time
from argparse import RawTextHelpFormatter

import requests
from dotenv import load_dotenv

load_dotenv()

USAGE = """侯爷的Blog自动化脚本
通过指定 id 和 title 自动创建 github issue
用法:
    ./pre-commit.py
"""

USERNAME = os.environ.get('GITHUB_USER')
TOKEN = os.environ.get('GITHUB_TOKEN')
TOOL = os.environ.get('TOOL')

# 默认评论所在的 repo
REPO_NAME = '%s.github.io' % USERNAME
# repo 的issues API地址
URL = 'https://api.github.com/repos/%s/%s/issues' % (USERNAME, REPO_NAME)

session = requests.Session()


def init_session():
    """检查 环境变量 和 传入参数"""
    if not USERNAME:
        print('[ERRO] 在.env 中未找到变量 USERNAME ')
        return 1
    if not TOKEN:
        print('[ERRO] 在.env 中未找到变量 TOKEN')
        return 1
    if not TOOL:
        print('[ERRO] 在.env 中未找到变量 TOOL')
        return 1

    # 使用 session 来进行授权
    session.auth = (USERNAME, TOKEN)
    return 0


def find_online_exist():
    '''找到现在已经存在的评论'''
    response = session.get(URL)
    exist_labels = []
    if response.status_code == 200:
        data = response.json()
        for each in data:
            for label in each["labels"]:
                l_name = label["name"]
                exist_labels.append(l_name)
        # 去重
        exist_labels = list(dict.fromkeys(exist_labels))
        return exist_labels
    else:
        return []


def create_issue(id, title):
    '''创建一个在 USERNAME.github.io 下的 issue 用于启用评论'''
    if not id:
        print('[ERRO] 未传入 id 参数')
        return 1
    if not title:
        print('[ERRO] 未传入 title 参数')
        return 1
    # print('[INFO] 开始创建 issue {0:s} '.format(title))
    # 内容
    issue = {'title': '%s 的评论' % title,
             'body': "# %s\nhttps://%s.github.io/index.html?p=%s" % (title, USERNAME, id),
             'labels': [TOOL, id]}

    # Post 请求
    response = session.post(URL, json.dumps(issue))
    if response.status_code == 201:
        print('[INFO] 创建 issue {0:s} 成功!'.format(title))
        return 0
    else:
        print('[ERRO] 创建 issue {0:s} 失败!'.format(title))
        print('[ERRO] Response:', response.content)
        return 1


def find_local_articles():
    '''在本地遍历 md 目录 寻找最新的文章'''
    for root, ds, fs in os.walk("./md/"):
        for f in fs:
            if f.endswith('.md'):
                fullname = os.path.join(root, f)
                id = f.removesuffix(".md")
                title = read_title(fullname)
                modifytime = time.ctime(os.path.getmtime(fullname))
                modifytime = datetime.datetime.strptime(
                    modifytime, '%a %b %d %H:%M:%S %Y')
                modifytime.strftime("%m/%d/%Y")
                yield {"id": id, "title": title, "modifytime": modifytime}


def read_title(filename):
    '''读取标题 默认都是第一行'''
    with open(filename, "r", encoding='utf-8') as file:
        title = file.readline()
        return title.removeprefix("# ").removesuffix("\n")


def update_index(article):
    '''读取 index 替换指定标签下的文章'''
    # 必须在index.md中存在
    REPLACE_TAG = "<!--ARTICLE-->\n\n"
    #
    print("[INFO] 更新 index 文章: %s 标题为: %s 修改时间: %s" %
          (article['id'], article['title'], article['modifytime']))
    # MARKDWON 格式的标题参数
    insert_info = "## [%s](index.html?p=%s) \n%s\n\n" % (
        article['title'], article['id'], article['modifytime'])
    # 读取 index.md
    content = ""
    with open("./md/index.md", "r", encoding='utf-8') as file:
        content = file.read()
    # 替换
    content = content.replace(REPLACE_TAG, REPLACE_TAG + insert_info)
    # 写入 index.md
    with open("./md/index.md", "w", encoding='utf-8') as file:
        file.write(content)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description=USAGE, formatter_class=RawTextHelpFormatter)
    # parser.add_argument('--id', type=str, default=None)
    # parser.add_argument('--title', type=str, default=None)
    parser.add_argument('-l', '--local', action='store_true')
    args = parser.parse_args()
    # print(args)
    # if check_env_and_var(args.id, args.title):
    #     exit(1)
    # else:
    #     result = create_issue(args.id, args.title)
    #     exit(result)
    init_session()
    exist_labels = find_online_exist()
    for article in find_local_articles():
        if article['id'] not in exist_labels:
            print("[INFO] 发现新文章: %s 标题为: %s" %
                  (article['id'], article['title']))
            update_index(article)
            if not args.local:
               # print("[INFO] create_issue")
               create_issue(article['id'], article['title'])
