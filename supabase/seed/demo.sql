do $$
declare
  v_uid uuid;
  v_day timestamptz := date_trunc('day', now());
begin
  select id into v_uid from auth.users where email = 'demo@finpay.app';

  if v_uid is null then
    raise exception 'demo@finpay.app not found — register the account first';
  end if;

  delete from public.transactions
  where user_id = v_uid
    and created_at < v_day;

  insert into public.transactions
    (user_id, type, amount, merchant, category, status, method, comment, created_at)
  select
    v_uid, d.type, d.amount, d.merchant, d.category, d.status, d.method, d.comment,
    v_day - (d.days_ago || ' days')::interval + (d.hour || ' hours')::interval
  from (values
    (1,  9,  'expense',  16700, 'Magnum Cash&Carry',            'food',         'completed', 'qr',   null),
    (1,  19, 'expense',  3100,  'Yandex Go',                    'transport',    'completed', 'qr',   null),
    (2,  10, 'expense',  4490,  'Netflix',                      'subscription', 'completed', 'card', null),
    (2,  11, 'expense',  2290,  'Spotify',                      'subscription', 'completed', 'card', null),
    (3,  13, 'transfer', 15000, 'Transfer to +77012345678',     'transfer',     'completed', 'phone','Rent share'),
    (3,  18, 'expense',  1800,  'Yandex Go',                    'transport',    'completed', 'qr',   null),
    (4,  12, 'expense',  9200,  'Wolt',                         'food',         'completed', 'qr',   null),
    (5,  15, 'expense',  3900,  'Coffee Boom',                  'food',         'completed', 'qr',   null),
    (5,  16, 'expense',  18500, 'Kaspi Marketplace',            'shopping',     'completed', 'card', null),
    (6,  11, 'expense',  24800, 'Magnum Cash&Carry',            'food',         'completed', 'qr',   null),
    (6,  20, 'expense',  2400,  'Yandex Go',                    'transport',    'completed', 'qr',   null),
    (8,  14, 'income',   145000,'Freelance — landing page',     'other',        'completed', null,   null),
    (8,  19, 'expense',  32400, 'Small',                        'food',         'completed', 'qr',   null),
    (10, 13, 'expense',  5600,  'Yandex Go',                    'transport',    'completed', 'qr',   null),
    (12, 17, 'transfer', 40000, 'Transfer to +77023456789',     'transfer',     'completed', 'phone','Dinner'),
    (14, 12, 'expense',  21900, 'Technodom',                    'shopping',     'completed', 'card', null),
    (16, 10, 'expense',  4490,  'Netflix',                      'subscription', 'completed', 'card', null),
    (18, 20, 'expense',  12300, 'Wolt',                         'food',         'completed', 'qr',   null),
    (20, 15, 'expense',  95000, 'Kaspi Marketplace',            'shopping',     'failed',    'card', null),
    (21, 16, 'expense',  45000, 'Sulpak',                       'shopping',     'completed', 'card', null),
    (24, 9,  'expense',  8700,  'Coffee Boom',                  'food',         'completed', 'qr',   null),
    (27, 18, 'transfer', 60000, 'Transfer to card 5169293812447701', 'transfer','completed', 'card', 'Birthday gift'),
    (30, 11, 'expense',  28900, 'Magnum Cash&Carry',            'food',         'completed', 'qr',   null),
    (33, 19, 'expense',  3200,  'Yandex Go',                    'transport',    'completed', 'qr',   null),
    (35, 10, 'income',   850000,'Salary — TechCorp',            'salary',       'completed', null,   null),
    (36, 15, 'income',   210000,'Freelance — mobile app',       'other',        'completed', null,   null),
    (38, 10, 'expense',  4490,  'Netflix',                      'subscription', 'completed', 'card', null),
    (40, 14, 'expense',  67000, 'Mechta',                       'shopping',     'completed', 'card', null),
    (44, 20, 'expense',  15800, 'Wolt',                         'food',         'completed', 'qr',   null),
    (47, 13, 'transfer', 25000, 'Transfer to +77054567890',     'transfer',     'completed', 'phone','Taxi'),
    (52, 11, 'expense',  31200, 'Magnum Cash&Carry',            'food',         'completed', 'qr',   null),
    (55, 9,  'expense',  9400,  'Coffee Boom',                  'food',         'completed', 'qr',   null),
    (58, 10, 'expense',  4490,  'Netflix',                      'subscription', 'completed', 'card', null),
    (61, 18, 'expense',  18700, 'Yandex Go',                    'transport',    'completed', 'qr',   null),
    (65, 10, 'income',   850000,'Salary — TechCorp',            'salary',       'completed', null,   null),
    (66, 16, 'expense',  52000, 'Technodom',                    'shopping',     'completed', 'card', null),
    (70, 11, 'expense',  26400, 'Magnum Cash&Carry',            'food',         'completed', 'qr',   null),
    (75, 20, 'expense',  11200, 'Wolt',                         'food',         'completed', 'qr',   null),
    (80, 10, 'expense',  4490,  'Netflix',                      'subscription', 'completed', 'card', null),
    (85, 15, 'expense',  38900, 'Kaspi Marketplace',            'shopping',     'completed', 'card', null),
    (90, 11, 'expense',  22100, 'Magnum Cash&Carry',            'food',         'completed', 'qr',   null),
    (95, 10, 'income',   850000,'Salary — TechCorp',            'salary',       'completed', null,   null),
    (95, 17, 'expense',  7300,  'Coffee Boom',                  'food',         'completed', 'qr',   null)
  ) as d(days_ago, hour, type, amount, merchant, category, status, method, comment);

  insert into public.recipients (user_id, name, phone)
  values
    (v_uid, 'Asel',   '7012345678'),
    (v_uid, 'Nurlan', '7023456789'),
    (v_uid, 'Dana',   '7017654321')
  on conflict (user_id, phone) do nothing;

  update public.profiles
  set balance = (
    select coalesce(sum(case when type = 'income' then amount else -amount end), 0)
    from public.transactions
    where user_id = v_uid
      and status = 'completed'
  )
  where id = v_uid;
end
$$;
