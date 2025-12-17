import json
import os
import psycopg2
import secrets
from datetime import datetime
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    VPN API для управления подключениями к серверам
    Методы: GET /servers, POST /connect, POST /disconnect, GET /status
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Session-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        params = event.get('queryStringParameters') or {}
        action = params.get('action', 'servers')
        
        if method == 'GET' and action == 'servers':
            cur.execute('''
                SELECT server_id, name, country_code, flag_emoji, ip_address, 
                       port, protocol, ping_ms, load_percent, current_users, 
                       max_users, is_active
                FROM vpn_servers 
                WHERE is_active = true
                ORDER BY ping_ms ASC
            ''')
            
            servers = []
            for row in cur.fetchall():
                servers.append({
                    'id': row[0],
                    'name': row[1],
                    'countryCode': row[2],
                    'flag': row[3],
                    'ipAddress': row[4],
                    'port': row[5],
                    'protocol': row[6],
                    'ping': row[7],
                    'load': row[8],
                    'currentUsers': row[9],
                    'maxUsers': row[10],
                    'isActive': row[11]
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'servers': servers}),
                'isBase64Encoded': False
            }
        
        if method == 'POST' and action == 'connect':
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('userId', 'guest_user')
            server_id = body.get('serverId')
            
            if not server_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'serverId is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('SELECT current_users, max_users FROM vpn_servers WHERE server_id = %s', (server_id,))
            server_data = cur.fetchone()
            
            if not server_data:
                cur.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Server not found'}),
                    'isBase64Encoded': False
                }
            
            current_users, max_users = server_data
            if current_users >= max_users:
                cur.close()
                conn.close()
                return {
                    'statusCode': 503,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Server is full'}),
                    'isBase64Encoded': False
                }
            
            session_token = secrets.token_urlsafe(32)
            
            cur.execute('''
                INSERT INTO vpn_sessions (user_id, server_id, session_token, status)
                VALUES (%s, %s, %s, 'active')
                RETURNING id, connected_at
            ''', (user_id, server_id, session_token))
            
            session_id, connected_at = cur.fetchone()
            
            cur.execute('''
                UPDATE vpn_servers 
                SET current_users = current_users + 1,
                    load_percent = LEAST(100, ROUND((current_users + 1)::numeric / max_users * 100))
                WHERE server_id = %s
            ''', (server_id,))
            
            cur.execute('''
                INSERT INTO user_profiles (user_id, total_connections)
                VALUES (%s, 1)
                ON CONFLICT (user_id) 
                DO UPDATE SET total_connections = user_profiles.total_connections + 1
            ''', (user_id,))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'sessionId': session_id,
                    'sessionToken': session_token,
                    'connectedAt': connected_at.isoformat()
                }),
                'isBase64Encoded': False
            }
        
        if method == 'POST' and action == 'disconnect':
            body = json.loads(event.get('body', '{}'))
            session_token = body.get('sessionToken')
            
            if not session_token:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'sessionToken is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                SELECT id, server_id, connected_at 
                FROM vpn_sessions 
                WHERE session_token = %s AND status = 'active'
            ''', (session_token,))
            
            session_data = cur.fetchone()
            
            if not session_data:
                cur.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Session not found'}),
                    'isBase64Encoded': False
                }
            
            session_id, server_id, connected_at = session_data
            disconnected_at = datetime.utcnow()
            duration = int((disconnected_at - connected_at).total_seconds())
            
            cur.execute('''
                UPDATE vpn_sessions 
                SET status = 'disconnected',
                    disconnected_at = %s,
                    duration_seconds = %s
                WHERE session_token = %s
            ''', (disconnected_at, duration, session_token))
            
            cur.execute('''
                UPDATE vpn_servers 
                SET current_users = GREATEST(0, current_users - 1),
                    load_percent = GREATEST(0, ROUND((current_users - 1)::numeric / max_users * 100))
                WHERE server_id = %s
            ''', (server_id,))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'duration': duration
                }),
                'isBase64Encoded': False
            }
        
        if method == 'GET' and action == 'history':
            user_id = params.get('userId', 'guest_user')
            
            cur.execute('''
                SELECT s.server_id, srv.name, srv.flag_emoji, 
                       s.connected_at, s.disconnected_at, s.duration_seconds,
                       s.data_downloaded_mb, s.data_uploaded_mb
                FROM vpn_sessions s
                JOIN vpn_servers srv ON s.server_id = srv.server_id
                WHERE s.user_id = %s AND s.status = 'disconnected'
                ORDER BY s.connected_at DESC
                LIMIT 20
            ''', (user_id,))
            
            history = []
            for row in cur.fetchall():
                history.append({
                    'serverId': row[0],
                    'serverName': row[1],
                    'flag': row[2],
                    'connectedAt': row[3].isoformat() if row[3] else None,
                    'disconnectedAt': row[4].isoformat() if row[4] else None,
                    'duration': row[5],
                    'downloaded': float(row[6]) if row[6] else 0,
                    'uploaded': float(row[7]) if row[7] else 0
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'history': history}),
                'isBase64Encoded': False
            }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Not found'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }